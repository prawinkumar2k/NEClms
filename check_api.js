import fetch from 'node-fetch';

async function check() {
  const res = await fetch('http://localhost:8080/api/users');
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
check();
