#!/usr/bin/env node
/**
 * Roteador de Modelos Jev (TypeSafe / OpenRouter) para Antigravity & Claude Code
 *
 * Intercepta as mensagens do usuário no gancho PreInvocation e avalia:
 * 1. Nível do pedido (simples, rotina, difícil) via primitiva Choice
 * 2. Risco de quebra via primitiva Noul
 * 3. Regras de escalação (risco > 70% ou confiança < 60% sobem 1 nível)
 * 4. Registro histórico em .agents/router_log.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar variáveis de ambiente de .env se existir
function loadEnv() {
  const rootDir = path.resolve(__dirname, '..', '..');
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.TYPESAFE_API_KEY;
const LOG_FILE = path.resolve(__dirname, '..', 'router_log.json');
const LAST_DECISION_FILE = path.resolve(__dirname, '..', 'last_router_decision.json');

const PROJECT_DESCRIPTION = 
  "Central de operação da WD Blocos: catálogo digital React + Vite, " +
  "backend FastAPI + PostgreSQL, regras de negócio e vendas de materiais de construção " +
  "para pessoas físicas, mestres de obra e construtoras.";

const PROFILES = {
  1: {
    name: "rapido",
    model: "Gemini 3.8 Flash / Haiku",
    directive: "Perfil RÁPIDO: Pedido pontual ou direto. Seja cirúrgico, ágil e conciso, sem delongas."
  },
  2: {
    name: "padrao",
    model: "Gemini 3.8 Pro / Sonnet",
    directive: "Perfil PADRÃO: Funcionalidade regular. Desenvolva com atenção ao contexto, cobertura de testes e boas práticas."
  },
  3: {
    name: "profundo",
    model: "Gemini Thinking / Opus",
    directive: "Perfil PROFUNDO: Tarefa crítica ou de alta complexidade. Faça raciocínio minucioso, analise efeitos colaterais, integridade e segurança. Se a sessão estiver rodando em modelo leve (Flash), sugira ao usuário alternar para um modelo de raciocínio profundo no seletor."
  }
};

// Ler dados do stdin
function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      return resolve('');
    }
    let input = '';
    process.stdin.setEncoding('utf8');
    
    // Timeout de segurança caso stdin não feche
    const timer = setTimeout(() => {
      resolve(input);
    }, 1500);
    timer.unref();

    process.stdin.on('data', chunk => {
      input += chunk;
    });

    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(input);
    });

    process.stdin.on('error', () => {
      clearTimeout(timer);
      resolve(input);
    });
  });
}

// Extrair última mensagem do usuário do arquivo transcript.jsonl
function getLastUserMessage(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n');

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'USER_INPUT' && parsed.content) {
          let text = parsed.content;
          // Limpar tags internas do sistema se houver
          const match = text.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
          if (match && match[1]) {
            text = match[1].trim();
          }
          return {
            text: text,
            stepIndex: typeof parsed.step_index === 'number' ? parsed.step_index : null
          };
        }
      } catch (e) {
        // Linha com erro de parsing, continua procurando
      }
    }
  } catch (err) {
    // Falha de leitura do transcript
  }
  return null;
}


// Chamar Jev via OpenRouter
function queryJev(userMessage) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "typesafe/jev-1.13",
      state: {
        project: PROJECT_DESCRIPTION,
        user_request: userMessage
      },
      questions: {
        nivel: {
          type: "choice",
          instructions: "Qual o nível do pedido?",
          criteria: {
            simples: "Mudança pequena e localizada, como texto, cor ou renomear algo",
            rotina: "Funcionalidade comum, tela nova, testes",
            dificil: "Bug sem causa conhecida, mudança que passa por várias partes do projeto, concorrência, segurança"
          }
        },
        risco_quebra: {
          type: "noul",
          instructions: "O pedido tem risco de quebrar algo que já funciona?"
        }
      }
    });

    const req = https.request('https://openrouter.ai/api/alpha/decisions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Erro ao fazer parse da resposta Jev: ${body}`));
          }
        } else {
          reject(new Error(`API Jev retornou status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na chamada ao Jev'));
    });

    req.write(payload);
    req.end();
  });
}

// Registrar logs em disco
function appendLog(entry) {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }
    logs.push(entry);
    // Manter últimos 500 registros
    if (logs.length > 500) logs = logs.slice(-500);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');

    // Gravar última decisão em arquivo separado para leitura rápida / status
    fs.writeFileSync(LAST_DECISION_FILE, JSON.stringify(entry, null, 2), 'utf8');
  } catch (err) {
    // Erro ao gravar log não deve derrubar o fluxo
  }
}

async function main() {
  const rawStdin = await readStdin();
  let hookContext = {};

  try {
    if (rawStdin.trim()) {
      hookContext = JSON.parse(rawStdin);
    }
  } catch (e) {
    // stdin não era JSON válido
  }

  // Obter mensagem do usuário (do transcript ou de argumento manual)
  let userMessage = null;
  let stepIndex = null;

  if (hookContext.transcriptPath) {
    const userMsgObj = getLastUserMessage(hookContext.transcriptPath);
    if (userMsgObj) {
      userMessage = userMsgObj.text;
      stepIndex = userMsgObj.stepIndex;
    }
  }

  if (!userMessage && process.argv[2]) {
    userMessage = process.argv.slice(2).join(' ');
  }

  // Se não encontrar mensagem ou mensagem começar com '!', ignora roteamento
  if (!userMessage) {
    console.log(JSON.stringify({ injectSteps: [] }));
    process.exit(0);
  }

  // Desduplicação: Se este mesmo turno do usuário já foi avaliado (mesmo stepIndex),
  // não repete a chamada à API Jev nem duplica registros no log
  if (stepIndex !== null && fs.existsSync(LAST_DECISION_FILE)) {
    try {
      const lastDecision = JSON.parse(fs.readFileSync(LAST_DECISION_FILE, 'utf8'));
      if (lastDecision && lastDecision.stepIndex === stepIndex) {
        console.log(JSON.stringify({ injectSteps: [] }));
        process.exit(0);
      }
    } catch (e) {
      // Ignora erro de leitura
    }
  }

  const cleanMessage = userMessage.trim();
  if (cleanMessage.startsWith('!')) {
    const bypassLog = {
      timestamp: new Date().toISOString(),
      stepIndex: stepIndex,
      message: cleanMessage,
      nivel: "bypass",
      confidence: 1.0,
      risk: 0,
      subagent: "bypass",
      timeMs: 0,
      note: "Mensagem iniciada com ponto de exclamação (sem roteamento)"
    };
    appendLog(bypassLog);

    console.log(JSON.stringify({
      injectSteps: [
        {
          ephemeralMessage: "⚡ [Roteador Jev] Prefixo '!' detectado: pedido executado sem roteamento automático."
        }
      ]
    }));
    process.exit(0);
  }

  if (!API_KEY) {
    console.log(JSON.stringify({ injectSteps: [] }));
    process.exit(0);
  }

  const startTime = Date.now();

  try {
    const jevResponse = await queryJev(cleanMessage);
    const timeMs = Date.now() - startTime;

    const answers = jevResponse.answers || {};
    const nivelData = answers.nivel || { choice: "rotina", confidence: 0.7 };
    const riscoData = answers.risco_quebra || { noul: 0.1 };

    const nivelChoice = nivelData.choice || "rotina"; // simples | rotina | dificil
    const confidence = typeof nivelData.confidence === 'number' ? nivelData.confidence : 0.7;
    const risk = typeof riscoData.noul === 'number' ? riscoData.noul : 0.1;

    // Mapeamento inicial
    let tier = 2; // rotina = padrão
    if (nivelChoice === 'simples') tier = 1;
    if (nivelChoice === 'dificil') tier = 3;

    const escalations = [];

    // Regra: Se o risco passar de 70%, sobe um nível
    if (risk > 0.70) {
      if (tier < 3) {
        tier += 1;
        escalations.push(`Risco elevado (${Math.round(risk * 100)}% > 70%)`);
      }
    }

    // Regra: Se o Jev estiver pouco confiante (confiança < 0.6), sobe um nível
    if (confidence < 0.60) {
      if (tier < 3) {
        tier += 1;
        escalations.push(`Baixa certeza do Jev (${Math.round(confidence * 100)}% < 60%)`);
      }
    }

    const chosen = PROFILES[tier];
    const statusLine = `roteador: ${nivelChoice}, ${confidence.toFixed(2)}, ${chosen.name} (${chosen.model.split('/')[0].trim()})`;

    const logEntry = {
      timestamp: new Date().toISOString(),
      stepIndex: stepIndex,
      message: cleanMessage,
      nivel: nivelChoice,
      confidence: parseFloat(confidence.toFixed(2)),
      risk: parseFloat(risk.toFixed(2)),
      subagent: chosen.name,
      model: chosen.model,
      timeMs: timeMs,
      escalations: escalations.length ? escalations.join('; ') : 'nenhuma',
      statusLine: statusLine
    };

    appendLog(logEntry);

    const escalationNotice = escalations.length ? `\n• Escalação: Subiu de nível devido a: ${escalations.join(', ')}` : '';

    const ephemeralMessage = 
      `🎯 **[Roteador Jev]** \`${statusLine}\`\n` +
      `• **Nível Avaliado:** \`${nivelChoice}\` (confiança: ${(confidence * 100).toFixed(0)}%)\n` +
      `• **Risco de Quebra:** ${(risk * 100).toFixed(0)}%\n` +
      `• **Perfil Indicado:** **${chosen.name.toUpperCase()}** (\`${chosen.model}\`)\n` +
      `• **Tempo do Jev:** ${timeMs}ms${escalationNotice}\n\n` +
      `👉 **[Diretriz Operacional]**: ${chosen.directive}`;

    console.log(JSON.stringify({
      injectSteps: [
        {
          ephemeralMessage: ephemeralMessage
        }
      ]
    }));
    process.exit(0);
  } catch (err) {
    // Em caso de falha de conexão com a API Jev, não trava o agente, apenas registra
    console.log(JSON.stringify({ injectSteps: [] }));
    process.exit(0);
  }
}

main();
