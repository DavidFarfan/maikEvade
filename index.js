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
const BITMART_API_KEY = 'e38032d54fc4f3cfcbc46d6933c56ca95503fb72';
const BITMART_API_SECRET = '503972188448f4b3a91b3f58d57e49ff2b1fa9962b44e6c97283d269e17e684c';
const BITMART_API_MEMO = 'WhaleEvade';
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
async function bitmart_withdraw(){
	const path = '/account/v1/withdraw/apply';
    const timestamp = get_timestamp();
    const body = {
        currency: 'PAMBI',
		amount: 0,
		address: 'A3oCgKqAdADBRJof7bKoJsGVfVJsyUXQxyCnJJjfsUga',
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
 
// ---------------------------------------------------	Conexión con Solana

/*
const {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
  PublicKey,
  TransactionInstruction,
  sendAndConfirmTransaction
} = require("@solana/web3.js");
let bs58 = require("bs58");

// Mi Wallet OKX
let my_secret = bs58.decode('gYrkyANKHS9ZpXatmSHay9c7zpQR4zY7uQZuGFDhrxs4kzQAkps1YWUCzscyrResjM1mcjTZ7AgQF655AbYLJYa');
let my_keypair = Keypair.fromSecretKey(my_secret);
let my_address = my_keypair._keypair.publicKey; // A3oCgKqAdADBRJof7bKoJsGVfVJsyUXQxyCnJJjfsUga

// La Wallet de Bitmart
let my_address_2 = bs58.decode('7Xow1jH6oLAGLFzaUNYs7Nc4L5SWbLrrxdNRCccZFHfr');

// Solana net program consumption
let my_program = '5WncPKXnrgoaqEu7JNBPE6FSqjdA2uJwZfErZn79jbJv'; // My Solana On-chain Programs
let connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
async function balance_print(){
	let balance = await connection.getBalance(new PublicKey(bs58.encode(my_address)), 'confirmed');
	console.log('Balance (SOL): ' + (balance/LAMPORTS_PER_SOL).toString());
};
balance_print();

// Create an empty transaction
console.log('Creating transaction...');
const transaction = new Transaction();
 
// Add my program instruction to the transaction
transaction.add(
  new TransactionInstruction({
    keys: [],
    programId: new PublicKey(my_program),
  }),
);

// Send the transaction to the Solana cluster
async function send(){
	console.log("Sending transaction...");
	let txHash = await sendAndConfirmTransaction(
	  connection,
	  transaction,
	  [my_keypair],
	);
	console.log("Transaction sent with hash:", txHash);
};
send();
// 3YEzs81RaUVzBCbGUUFHB1uNvxNy6vfwS4X8wN46dFpyNKggqsZmoqSDtr3ppGEgNXJdawVnHkfnUwtmpmUBa3Rc
*/

// import
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

// Codificación base 58
let bs58 = require("bs58");

// La Wallet OKX
let my_secret = bs58.decode('gYrkyANKHS9ZpXatmSHay9c7zpQR4zY7uQZuGFDhrxs4kzQAkps1YWUCzscyrResjM1mcjTZ7AgQF655AbYLJYa');
let my_keypair = Keypair.fromSecretKey(my_secret);
let my_address = my_keypair._keypair.publicKey; // A3oCgKqAdADBRJof7bKoJsGVfVJsyUXQxyCnJJjfsUga
 
// La Wallet de Bitmart
let my_address_2 = bs58.decode('7Xow1jH6oLAGLFzaUNYs7Nc4L5SWbLrrxdNRCccZFHfr');

 // La Wallet Brave
 let my_secret_3 = bs58.decode('3iQvoA2hHqWr5fSsUqKuX9qSbZwgiEZtnhVeRPhokoiQ3LbpDDckzMDY6XWRTCqaffYKKoHVBgzdyinKwxgTycBi');
let my_keypair_3 = Keypair.fromSecretKey(my_secret_3);
let my_address_3 = my_keypair_3._keypair.publicKey; // BZcRxMuQdV9WkvZficAg8E6bp8cGSpQXfzEK22JN5Jmn
//console.log(bs58.encode(my_address_3));

// Solana net program consumption
let connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
async function balance_print(){
	let balance_s = await connection.getBalance(new PublicKey(bs58.encode(my_address)), 'confirmed');
	console.log('Balance Sender (SOL): ' + (balance_s/LAMPORTS_PER_SOL).toString());
	let balance_rs = await connection.getBalance(new PublicKey(bs58.encode(my_address_3)), 'confirmed');
	console.log('Balance Receiver (SOL): ' + (balance_rs/LAMPORTS_PER_SOL).toString());
};
//balance_print();

// Pambi Transactions
async function getTransactions(wallet1, wallet2){
	
	// Suma que no aparece como transfer
	let no_appearing = await connection.getTransaction(
		'44xfPN1XD2xytpzTKxGo4zxp1MYVX7smceGzE2rXRNQqA5EhfjXHnzpUvhHtZBm3HgwkaCNEpbtXwvHp5QTMNbMr',
		{"maxSupportedTransactionVersion": 0},
	);
	console.log(no_appearing.transaction.message.compiledInstructions);
	
	// Account 1s
	let pambi_account_1 = await getOrCreateAssociatedTokenAccount(
		connection,
		my_keypair,
		new PublicKey('3TdsyqMn2sCqxEFf9B8hATCrMEW1Xh2thUTs7fpr2Rur'),
		wallet1,
	);
	console.log('Pambi Account 1: ' + pambi_account_1.address);
	console.log('Owned by: ' + pambi_account_1.owner);
	
	// Account 2
	let pambi_account_2 = await getOrCreateAssociatedTokenAccount(
		connection,
		my_keypair,
		new PublicKey('3TdsyqMn2sCqxEFf9B8hATCrMEW1Xh2thUTs7fpr2Rur'),
		wallet2,
	);
	console.log('Pambi Account 2: ' + pambi_account_2.address);
	console.log('Owned by: ' + pambi_account_2.owner);
	
	// Get all Transactions
	let signatures = await connection.getSignaturesForAddress(
		wallet1,
		{
			limit: 150
		}
	);
	signatures = signatures.map(tran=>tran.signature);
	let rough_transactions = await connection.getParsedTransactions(
		signatures,
		{'maxSupportedTransactionVersion': 0}
	);
	let transactions = rough_transactions.map(tran=>tran.transaction.message.instructions);
	
	// Include only relevant transfers
	let relevant_transactions = [];
	for(let i=0; i<transactions.length; i++){
		let relevant_instructions = [];
		for(let j=0; j<transactions[i].length; j++){
			relevant_instructions.push(transactions[i][j]);
		};
		relevant_transactions.push({
			signature: signatures[i],
			instructions: relevant_instructions,
		});
	};
	
	// Output
	let data = JSON.stringify({ 'Output':relevant_transactions }, null, 4);
	fs.writeFile("output.txt", data, (err) => {
	  if (err)
		console.log(err);
	  else {
		console.log("File written successfully\n");
	  }
	});
};

getTransactions(
	new PublicKey(bs58.encode(my_address)),
	new PublicKey(bs58.encode(my_address_3)),
);

// Pambi info.
async function pambinfo(){
	console.log('Pambi info.:');
	let pambi_mint = await getMint(
		connection,
		new PublicKey('3TdsyqMn2sCqxEFf9B8hATCrMEW1Xh2thUTs7fpr2Rur'),
	);
	//console.log(pambi_mint);
	
	/*// Transfer Pambi
    let tx_transfer = await transfer(
        connection,
        my_keypair,
        my_pambi_account.address,
        my_pambi_account_3.address,
        my_keypair,
        10 * LAMPORTS_PER_SOL
    );
	console.log('Confirmation Hash:');
	console.log(tx_transfer);
	*/
	//let acc_info = await connection.getAccountInfo(new PublicKey('JDFWcBDCfxpXXaF5fi4Ndxt1eRjG9cRM1xt6FmMU59yK'));
	//console.log(acc_info);
};

// Send the transaction to the Solana cluster
async function send(){
	console.log("Sending transaction...");
	let txHash = await sendAndConfirmTransaction(
	  connection,
	  transaction,
	  [my_keypair],
	)
	console.log("Transaction sent with hash:", txHash);
};
//send();