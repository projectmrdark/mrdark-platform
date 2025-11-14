import { ToolRegistry } from "./registry";
import { fileReadTool, fileWriteTool, fileListTool } from "./file-tools";
import { webSearchTool, imageSearchTool, newsSearchTool } from "./search-tools";
import { executePythonTool, executeJavaScriptTool, executeShellTool } from "./code-tools";
import {
  browserNavigateTool,
  browserClickTool,
  browserTypeTool,
  browserScreenshotTool,
  browserExtractTool,
  browserWaitTool,
  browserEvaluateTool,
} from "./browser-automation";
import {
  imageGenerateTool,
  imageEditTool,
  dataAnalyzeTool,
  dataVisualizeTool,
} from "./ai-tools";
import {
  pdfReadTool,
  pdfCreateTool,
  excelReadTool,
  excelCreateTool,
  wordReadTool,
  wordCreateTool,
  markdownToHtmlTool,
  csvParseTool,
  jsonToCsvTool,
} from "./document-tools";
import {
  getCurrentTimeTool,
  calculateTool,
  convertUnitTool,
  generateUuidTool,
  generateRandomTool,
  hashTool,
  base64EncodeTool,
  base64DecodeTool,
  urlEncodeTool,
  urlDecodeTool,
} from "./system-tools";
import {
  httpGetTool,
  httpPostTool,
  httpPutTool,
  httpDeleteTool,
  graphqlQueryTool,
  webhookSendTool,
  jsonParseTool,
  jsonStringifyTool,
  xmlParseTool,
  regexMatchTool,
  regexReplaceTool,
} from "./api-tools";
import {
  gitCloneTool,
  gitStatusTool,
  gitCommitTool,
  gitPushTool,
  gitPullTool,
  gitBranchTool,
  gitCheckoutTool,
  gitLogTool,
  gitDiffTool,
} from "./git-tools";
import {
  npmInstallTool,
  npmUninstallTool,
  npmRunTool,
  pipInstallTool,
  pipUninstallTool,
  pipListTool,
  yarnInstallTool,
  pnpmInstallTool,
} from "./package-tools";
import {
  sqlQueryTool,
  sqlInsertTool,
  sqlUpdateTool,
  sqlDeleteTool,
  sqlTableInfoTool,
  sqlListTablesTool,
} from "./database-tools";
import {
  pingTool,
  curlTool,
  checkPortTool,
  systemInfoTool,
  processListTool,
  diskUsageTool,
  networkStatsTool,
  logTailTool,
  logGrepTool,
  healthCheckTool,
} from "./monitoring-tools";
import {
  textToUpperTool,
  textToLowerTool,
  textTrimTool,
  textReplaceTool,
  textSplitTool,
  textJoinTool,
  textCountWordsTool,
  textExtractEmailsTool,
  textExtractUrlsTool,
  textSlugifyTool,
  textTruncateTool,
  textReverseTool,
  textCapitalizeTool,
  textRemoveDuplicatesTool,
  textSortLinesTool,
} from "./text-tools";
import {
  arrayFilterTool,
  arrayMapTool,
  arrayReduceTool,
  arraySortTool,
  arrayUniqueTool,
  arrayGroupByTool,
  objectMergeTool,
  objectPickTool,
  objectOmitTool,
  dataValidateTool,
} from "./data-tools";
import {
  encryptAesTool,
  decryptAesTool,
  generateKeyTool,
  hmacTool,
  verifyHmacTool,
  pbkdf2Tool,
  jwtSignTool,
  jwtVerifyTool,
} from "./crypto-tools";
import {
  gzipCompressTool,
  gzipDecompressTool,
  zipCreateTool,
  zipExtractTool,
  zipListTool,
  tarCreateTool,
  tarExtractTool,
  tarListTool,
} from "./compression-tools";
import {
  dateFormatTool,
  dateAddTool,
  dateDiffTool,
  dateCompareTool,
  dateIsWeekendTool,
  dateGetDayOfWeekTool,
  dateGetMonthTool,
  timestampToDateTool,
  dateToTimestampTool,
  dateStartOfDayTool,
  dateEndOfDayTool,
} from "./datetime-tools";
import {
  dnsLookupTool,
  dnsResolveTool,
  whoisTool,
  tracerouteTool,
  nslookupTool,
  netstatTool,
  portScanTool,
  getPublicIpTool,
  getLocalIpTool,
  downloadFileTool,
} from "./network-tools";
import {
  validateEmailTool,
  validateUrlTool,
  validateIpTool,
  validateJsonTool,
  validatePhoneTool,
  validateCreditCardTool,
  mathAbsTool,
  mathPowerTool,
  mathSqrtTool,
  mathRoundTool,
  mathMinMaxTool,
  mathAverageTool,
  mathPercentageTool,
} from "./validation-tools";

export function initializeTools(registry: ToolRegistry): void {
  // File tools
  registry.register(fileReadTool);
  registry.register(fileWriteTool);
  registry.register(fileListTool);

  // Search tools
  registry.register(webSearchTool);
  registry.register(imageSearchTool);
  registry.register(newsSearchTool);

  // Code execution tools
  registry.register(executePythonTool);
  registry.register(executeJavaScriptTool);
  registry.register(executeShellTool);

  // Browser tools
  registry.register(browserNavigateTool);
  registry.register(browserClickTool);
  registry.register(browserTypeTool);
  registry.register(browserScreenshotTool);
  registry.register(browserExtractTool);
  registry.register(browserWaitTool);
  registry.register(browserEvaluateTool);

  // AI tools
  registry.register(imageGenerateTool);
  registry.register(imageEditTool);
  registry.register(dataAnalyzeTool);
  registry.register(dataVisualizeTool);

  // Document tools
  registry.register(pdfReadTool);
  registry.register(pdfCreateTool);
  registry.register(excelReadTool);
  registry.register(excelCreateTool);
  registry.register(wordReadTool);
  registry.register(wordCreateTool);
  registry.register(markdownToHtmlTool);
  registry.register(csvParseTool);
  registry.register(jsonToCsvTool);

  // System tools
  registry.register(getCurrentTimeTool);
  registry.register(calculateTool);
  registry.register(convertUnitTool);
  registry.register(generateUuidTool);
  registry.register(generateRandomTool);
  registry.register(hashTool);
  registry.register(base64EncodeTool);
  registry.register(base64DecodeTool);
  registry.register(urlEncodeTool);
  registry.register(urlDecodeTool);

  // API tools
  registry.register(httpGetTool);
  registry.register(httpPostTool);
  registry.register(httpPutTool);
  registry.register(httpDeleteTool);
  registry.register(graphqlQueryTool);
  registry.register(webhookSendTool);
  registry.register(jsonParseTool);
  registry.register(jsonStringifyTool);
  registry.register(xmlParseTool);
  registry.register(regexMatchTool);
  registry.register(regexReplaceTool);

  // Git tools
  registry.register(gitCloneTool);
  registry.register(gitStatusTool);
  registry.register(gitCommitTool);
  registry.register(gitPushTool);
  registry.register(gitPullTool);
  registry.register(gitBranchTool);
  registry.register(gitCheckoutTool);
  registry.register(gitLogTool);
  registry.register(gitDiffTool);

  // Package manager tools
  registry.register(npmInstallTool);
  registry.register(npmUninstallTool);
  registry.register(npmRunTool);
  registry.register(pipInstallTool);
  registry.register(pipUninstallTool);
  registry.register(pipListTool);
  registry.register(yarnInstallTool);
  registry.register(pnpmInstallTool);

  // Database tools
  registry.register(sqlQueryTool);
  registry.register(sqlInsertTool);
  registry.register(sqlUpdateTool);
  registry.register(sqlDeleteTool);
  registry.register(sqlTableInfoTool);
  registry.register(sqlListTablesTool);

  // Monitoring tools
  registry.register(pingTool);
  registry.register(curlTool);
  registry.register(checkPortTool);
  registry.register(systemInfoTool);
  registry.register(processListTool);
  registry.register(diskUsageTool);
  registry.register(networkStatsTool);
  registry.register(logTailTool);
  registry.register(logGrepTool);
  registry.register(healthCheckTool);

  // Text tools
  registry.register(textToUpperTool);
  registry.register(textToLowerTool);
  registry.register(textTrimTool);
  registry.register(textReplaceTool);
  registry.register(textSplitTool);
  registry.register(textJoinTool);
  registry.register(textCountWordsTool);
  registry.register(textExtractEmailsTool);
  registry.register(textExtractUrlsTool);
  registry.register(textSlugifyTool);
  registry.register(textTruncateTool);
  registry.register(textReverseTool);
  registry.register(textCapitalizeTool);
  registry.register(textRemoveDuplicatesTool);
  registry.register(textSortLinesTool);

  // Data tools
  registry.register(arrayFilterTool);
  registry.register(arrayMapTool);
  registry.register(arrayReduceTool);
  registry.register(arraySortTool);
  registry.register(arrayUniqueTool);
  registry.register(arrayGroupByTool);
  registry.register(objectMergeTool);
  registry.register(objectPickTool);
  registry.register(objectOmitTool);
  registry.register(dataValidateTool);

  // Crypto tools
  registry.register(encryptAesTool);
  registry.register(decryptAesTool);
  registry.register(generateKeyTool);
  registry.register(hmacTool);
  registry.register(verifyHmacTool);
  registry.register(pbkdf2Tool);
  registry.register(jwtSignTool);
  registry.register(jwtVerifyTool);

  // Compression tools
  registry.register(gzipCompressTool);
  registry.register(gzipDecompressTool);
  registry.register(zipCreateTool);
  registry.register(zipExtractTool);
  registry.register(zipListTool);
  registry.register(tarCreateTool);
  registry.register(tarExtractTool);
  registry.register(tarListTool);

  // DateTime tools
  registry.register(dateFormatTool);
  registry.register(dateAddTool);
  registry.register(dateDiffTool);
  registry.register(dateCompareTool);
  registry.register(dateIsWeekendTool);
  registry.register(dateGetDayOfWeekTool);
  registry.register(dateGetMonthTool);
  registry.register(timestampToDateTool);
  registry.register(dateToTimestampTool);
  registry.register(dateStartOfDayTool);
  registry.register(dateEndOfDayTool);

  // Network tools
  registry.register(dnsLookupTool);
  registry.register(dnsResolveTool);
  registry.register(whoisTool);
  registry.register(tracerouteTool);
  registry.register(nslookupTool);
  registry.register(netstatTool);
  registry.register(portScanTool);
  registry.register(getPublicIpTool);
  registry.register(getLocalIpTool);
  registry.register(downloadFileTool);

  // Validation tools
  registry.register(validateEmailTool);
  registry.register(validateUrlTool);
  registry.register(validateIpTool);
  registry.register(validateJsonTool);
  registry.register(validatePhoneTool);
  registry.register(validateCreditCardTool);

  // Math tools
  registry.register(mathAbsTool);
  registry.register(mathPowerTool);
  registry.register(mathSqrtTool);
  registry.register(mathRoundTool);
  registry.register(mathMinMaxTool);
  registry.register(mathAverageTool);
  registry.register(mathPercentageTool);
}

export * from "./registry";
