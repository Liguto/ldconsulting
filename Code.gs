/**
 * =========================================================================
 * LD CONSULTING - BACKEND SERVERLESS LEVE VIA GOOGLE APPS SCRIPT
 * Projeto: Agendamento Inteligente & Captura de Leads em Google Sheets
 * Deploy via clasp:
 *   1. npm install -g @google/clasp
 *   2. clasp login
 *   3. clasp create --title "LD-Consulting-Leads-Webhook" --type webapp
 *   4. clasp push
 *   5. clasp deploy --description "v1.0.0"
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Aguarda até 30 segundos para evitar concorrência em gravações simultâneas
  lock.tryLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // Se a aba for nova ou estiver vazia, cria o cabeçalho estilizado
    if (sheet.getLastRow() === 0) {
      var headers = ["Data e Hora", "Nome Completo", "WhatsApp", "Número Limpo", "Ramo / Segmento", "Mensagem / Detalhes", "Origem", "Navegador"];
      sheet.appendRow(headers);
      
      // Estilização do cabeçalho
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#38BDF8");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Formatação de data em fuso horário de São Paulo (GMT-3)
    var timestamp = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm:ss");

    // Adiciona o novo lead como uma nova linha na planilha
    sheet.appendRow([
      timestamp,
      data.nome || "",
      data.whatsapp || "",
      data.whatsapp_numeros || "",
      data.ramo_atuacao || data.especialidade || "",
      data.mensagem || data.desafio_principal || "",
      data.origem || "",
      data.navegador || ""
    ]);

    // Retorna resposta JSON confirmando o salvamento
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead salvo com sucesso na planilha Google!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "LD Consulting Webhook API",
    version: "1.0.0"
  })).setMimeType(ContentService.MimeType.JSON);
}
