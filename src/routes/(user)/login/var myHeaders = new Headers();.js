var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "username": "Ericsson",
    "password": "admin"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("https://script.google.com/macros/s/AKfycbygTngNfc5fjdmbuGJ9l5wsBTDAR3oA6s1HSJ9ikRpr7aZj9d_N2OSXSCHCs1Nt7YHJ/exec?action=login", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));