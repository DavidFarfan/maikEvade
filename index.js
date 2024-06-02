//------------------------ APP CON NODE, EJS Y EXPRESS -------------------

// Importar el módulo progre 'Express'
const express = require('express');
const app = express();

// Path para el manejo de direcciones
const path = require('path');

// Puerto 3000
app.set('port', 3000);

// Integrar el procesador HTML: EJS
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Establecer la ubicación de las vistas
app.set('views', path.join(__dirname, 'views'));

// Módulo para el manejo de las rutas
app.use(require('./routes/'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// Inicio
app.listen(app.get('port'), () => {
	console.log("<>Running on port 3000...");
});

// ---------------------------------------------------	Conexión con BitMart
const axios = require('axios');
const crypto = require('crypto');
const BITMART_API_KEY = process.env.BITMART_API_KEY;
const BITMART_API_SECRET = process.env.BITMART_API_SECRET;
const BITMART_API_MEMO = process.env.BITMART_API_MEMO;
const BITMART_BASE_URL = 'https://api-cloud.bitmart.com';

// Get current timestamp
function get_timestamp() {
    return new Date().getTime().toString();
}

// Generate signature
function generate_signature(timestamp, body) {
    const message = `${timestamp}#${BITMART_API_MEMO}#${body}`;
    return crypto.createHmac('sha256', BITMART_API_SECRET).update(message).digest('hex');
};

// Bitmart Account balance
// ¿Cuál es mi portafolio?: Eso es info. privada, pero no es una tx. Necesita llave, pero no una firma.
async function bitmart_balance(){
	const path = "/account/v1/wallet";
	const headers = {
        'Content-Type': 'application/json',
        'X-BM-KEY': BITMART_API_KEY
    };
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.get(url, {headers});
        console.log(response.data.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};

// Bitmart Place order
// Necesito tradear PAMBI: Poner una orden implica hacer una tx (transfer). Necesita firma y llave.
async function bitmart_place_order() {
    const path = '/spot/v2/submit_order';
    const timestamp = get_timestamp();
    const body = {
        size: 100,
        price: 50000,
        side: 'sell',
        symbol: 'BTC_USDT',
        type: 'limit',
    };
    const headers = {
        'Content-Type': 'application/json',
        'X-BM-KEY': BITMART_API_KEY,
        'X-BM-TIMESTAMP': timestamp,
        'X-BM-SIGN': generate_signature(timestamp, JSON.stringify(body)),
    };
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.post(url, body, { headers });
        console.log(response.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};

// Bitmart All Currencies
// ¿Cuáles son las monedas listadas en BItMart?: Eso es info. pública. No necesita llave ni firma.
async function bitmart_allCurrencies(){
	const path = "/spot/v1/currencies";
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.get(url);
        console.log(response.data.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};

// Bitmart Trades Pambi
// ¿Cuáles son las trades más recientes que se han hecho con PAMBI_USDT?: Info. pública.
async function bitmart_trades_pambi(){
	const path = "/spot/quotation/v3/trades";
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.get(url, {
			params: {
				symbol: 'PAMBI_USDT'
			}
		});
        console.log(response.data.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};

// Bitmart Withdraw_quota
// ¿Cuáles son los cargos de PAMBI para hoy (mínimo retiro, comisión, etc.)?: El monto que se ha retirado en el día es personal, por tanto requiere llave.
// El monto mínimo es una restricción a las tx, pero no es intrínseca a la wallet, sino impuesta por la exchange. Además, por ser sólo una consulta, no necesita firma.
async function bitmart_withdraw_quota(){
	const path = "/account/v1/withdraw/charge";
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.get(url, {
			params: {
				'currency': 'PAMBI'
			},
			headers: {
				'Content-Type': 'application/json',
				'X-BM-KEY': BITMART_API_KEY,
			}
		});
        console.log(response.data.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};

// Bitmart Withdraw
// Necesito hacer una transferencia de PAMBI: es una tx, necesita firma y llave.
async function bitmart_withdraw(address_58){
	const path = '/account/v1/withdraw/apply';
    const timestamp = get_timestamp();
    const body = {
        currency: 'PAMBI',
		amount: 0,
		address: address_58,
		address_memo: '',
		destination: 'test01',
    };
    const headers = {
        'Content-Type': 'application/json',
        'X-BM-KEY': BITMART_API_KEY,
        'X-BM-TIMESTAMP': timestamp,
        'X-BM-SIGN': generate_signature(timestamp, JSON.stringify(body)),
    };
    const url = BITMART_BASE_URL + path;
    try {
        const response = await axios.post(url, body, { headers });
        console.log(response.data);
    } catch (error) {
        console.error(`Error:`);
        console.error(error.response.data);
    };
};
 
 //----------------- Solana JS Client
 
 // Module to write output
var fs = require('fs');

// SolanaWeb3API
const {
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
  PublicKey,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// TokenProgram
const {
	getMint,
	getOrCreateAssociatedTokenAccount,
	transfer,
} = require("@solana/spl-token");

// Codificación en base 58
let bs58 = require("bs58");
 
// ------------------------My wallets
 
// My Wallet
 const MY_SIGN = signer_from_58(process.env.MY_WALLET);
 const MY_ADDRESS = address_from_signer(MY_SIGN);

// My OKX Wallet
 const MY_OKX_SIGN = signer_from_58(process.env.MY_OKX_WALLET);
 const MY_OKX_ADDRESS = address_from_signer(MY_OKX_SIGN);
 
// My Brave Wallet
 const MY_BRAVE_SIGN = signer_from_58(process.env.MY_BRAVE_WALLET);
 const MY_BRAVE_ADDRESS = address_from_signer(MY_BRAVE_SIGN);
 
// My Bitmart Wallet
const MY_BITMART_ADDRESS = address_from_58(process.env.MY_BITMART_ADDRESS);

//-----------------------Solana app
// El token Pambi
const PAMBI_ADDRESS = address_from_58('3TdsyqMn2sCqxEFf9B8hATCrMEW1Xh2thUTs7fpr2Rur');

// Signer from Secret String
function signer_from_58(string){
	return Keypair.fromSecretKey(bs58.decode(string)); 
};

// Signer from Secret Array
function signer_from_array(array){
	return Keypair.fromSecretKey(array); 
};

// Public key from Base 58
function address_from_58(string){
	return new PublicKey(string);
};

// Public key from Array
function address_from_array(array){
	return new PublicKey(bs58.encode(array));
};

// Public key from Signer
function address_from_signer(signer){
	return address_from_58(bs58.encode(signer._keypair.publicKey)); 
};

// Write Output
function write_to_output(object){
	let data = JSON.stringify({ 'Output':object }, null, 4);
	fs.writeFile("output.txt", data, (err) => {
	  if (err)
		console.log(err);
	  else {
		console.log("File written successfully\n");
	  }
	});
};

// Solana Clusters
let MAINNET_BETA = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
let DEVNET = new Connection(clusterApiUrl("devnet"), "confirmed");

// SOL Balance
async function balance(conn, address){
	let lamports = await conn.getBalance(address, 'confirmed');
	return 'Balance of: ' + address.toString() + ' (SOL): ' + (lamports/LAMPORTS_PER_SOL).toString();
};

// Token Account
async function token_account(conn, signer, token, wallet){
	let ata = await getOrCreateAssociatedTokenAccount(
		conn,
		signer,
		token,
		wallet,
	);
	return ata;
};

// Transfer list
async function get_transactions(conn, wallet){
	
	// Get all Transactions
	let signatures = await conn.getSignaturesForAddress(
		wallet,
		{
			limit: 10
		}
	);
	signatures = signatures.map(sig=>sig.signature);
	let transactions = await conn.getParsedTransactions(
		signatures,
		{"maxSupportedTransactionVersion": 0},
	);
	return transactions;
};

// Solana Transfer
async function sol_transfer(conn, amount, signer, wallet){
	
	// Void Transaction
	let transaction = new Transaction();
	
	// Add Transfer Instruction
	transaction.add(
	  SystemProgram.transfer({
		'fromPubkey': address_from_signer(signer),
		'toPubkey': wallet,
		'lamports': amount * LAMPORTS_PER_SOL,
	  }),
	);
	 
	// Send and confirm
	let signature = await sendAndConfirmTransaction(
		conn,
		transaction,
		[signer]
	);
	return signature;
};

// Token Transfer
async function token_transfer(conn, token, signer, destination, amount){
	
	// Token accounts
	let ata1 = await token_account(conn, signer, token, address_from_signer(signer));
	let ata2 = await token_account(conn, signer, token, destination);
	
	// Transfer
	let transfer_signature  = await transfer(
		conn,
		signer,
		ata1,
		ata2,
		signer,
		amount * LAMPORTS_PER_SOL,
	);
	return transfer_signature;
};

// Main Program
async function main_program(){
	let setup = await balance(
		MAINNET_BETA,
		MY_ADDRESS
	);
	console.log(setup);
};
main_program();