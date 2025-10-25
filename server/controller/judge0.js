import axios from 'axios';

const BASE = 'https://ce.judge0.com';
const API_KEY = process.env.JUDGE0_API_KEY || '';  

function judge0Headers() {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-Auth-Token'] = API_KEY;  
  return headers;
}

// Create submission 
async function createSubmission({ source_code, language_id, stdin, base64_encoded=false}) {
  const url = `${BASE}/submissions/?base64_encoded=${base64_encoded}&wait=false`;
  const payload = { source_code, language_id };
  if (stdin) payload.stdin = stdin; 
  const res = await axios.post(url, payload, { headers: judge0Headers() });
  return res.data;
}

// Get submission result
async function getResult(token, { base64_encoded=false } = {}) {
  const url = `${BASE}/submissions/${token}?base64_encoded=${base64_encoded}`;
  const res = await axios.get(url, { headers: judge0Headers() });
  return res.data;
}

export {
    createSubmission,
    getResult
}
