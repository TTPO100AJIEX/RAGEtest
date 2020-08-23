const fs = require('fs');
var players = require("../0dimension/players.json");
var ableChars = `!#$&()*+,-.0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{}~абвгдежзийклмнопрстуфхцчшщъыьэюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ`;
function to89(a)
{
    let S = BigInt('0b' + a);
    let resS = "";
    while (S != 0)
    {
        resS = resS + ableChars[S % BigInt(ableChars.length)];
        S = S / BigInt(ableChars.length);
    }
    return(resS);
}
function messUp2(a)
{
    if (a.length % 2 == 0)
    {
        let b = "";
        for (let i = 0; i < a.length / 2; i++)
        {
            b = b + a[i] + a[a.length - i - 1];
        }
        let c = b;
        for (let i = 0; i < b.length; i+=2)
        {
            c[Math.floor(c.length / 2) - Math.floor(i / 2) - 1] = b[i];
            c[Math.floor(c.length / 2) + Math.floor(i / 2)] = b[i + 1];
        }
        return(c);
    }
    else
    {
        let b = "";
        for (let i = 0; i < a.length / 2; i++)
        {
            b = b + a[i] + a[a.length - i - 1];
        }
        b = b + a[Math.floor(a.length / 2)];
        let c = b;
        c[Math.floor(c.length / 2)] = b[b.length - 1];
        for (let i = 0; i < b.length; i+=2)
        {
            c[Math.floor(c.length / 2) - Math.floor(i / 2) - 1] = b[i];
            c[Math.floor(c.length / 2) + Math.floor(i / 2) + 1] = b[i + 1];
        }
        return(c);
    }
}
function messUp(a)
{
    if (a.length < 255)
    {
        let start = 0;
        while (a.length < 255)
        {
            start = start + 1;
            for (let i = start; i < a.length && a.length < 255; i+=7)
            {
                a = a + a[i];
            }
        }
    }
    let b = "";
    for (let i = 0; i < a.length / 2; i++)
    {
        b = b + a[i] + a[a.length - i - 1];
    }
    b = b + a[Math.floor(a.length / 2)];
    for (let i = Math.floor(b.length / 5); i < Math.ceil(b.length - b.length / 5); i+=3)
    {
        b = messUp2(b.substring(0, i)) + messUp2(b.substring(i));
    }
    let c = b;
    c[Math.floor(c.length / 2)] = b[254];
    for (let i = 0; i < b.length; i+=2)
    {
        c[Math.floor(c.length / 2) - Math.floor(i / 2) - 1] = b[i];
        c[Math.floor(c.length / 2) + Math.floor(i / 2) + 1] = b[i + 1];
    }
    return(c);
}
function passwordHashing(password, salt)
{
    console.time('test');
    for (let j = 0; j < salt.length; j++)
    {
        for (let i = 0; i < password.length; i+=2)
        {
            if (salt.length == j)
                break;
            password = password.substring(0, i) + salt[j] + password.substr(i);
            j++;
        }
    }
    for (let cou = 0; cou < 128; cou++)
    {
        let newIteration = "";
        password = password.substr(0, 126);
        for (let i = 0; i < password.length; i++)
        {
            let tmp = "00000000" + password.charCodeAt(i).toString(2);
            tmp = tmp.split("").reverse().join("");
            newIteration = newIteration + tmp.substr(0, 8);
        }
        password = messUp(to89(messUp2(newIteration)).substr(0, 255)).substr(0, 126);
    }
    let result = "";
    for (let i = 0; i < password.length; i++)
    {
        let tmp = "00000000" + password.charCodeAt(i).toString(2);
        tmp = tmp.split("").reverse().join("");
        result = result + tmp.substr(0, 8);
    }
    console.timeEnd('test');
    return(messUp(BigInt('0b' + messUp2(result)).toString(16).substr(0, 255)).substr(64, 126));
}
function nicknameHashing(s)
{
    let hash = 0;
    for (i = 0; i < s.length; i++) 
    {
        hash = (((hash << 5) - hash + s.charCodeAt(i)) << 0);
    }
    return(hash % 1048576 + 1048576 * (hash < 0));
}
function getSalt()
{
    let salt = "";
    for (let i = 0; i < 125; i++)
    {
        salt = salt + ableChars[Math.floor(Math.random() * ableChars.length)];
    }
    return(salt);
}
mp.events.add('newAccount', (player, nickname, password, question, answer) =>
{
    setTimeout(function()
    {
        if (nickname == "default")
        {
            player.call('incorrectNickname');
            return;
        }
        let ind = nicknameHashing(nickname);
        if (players[ind].length == 0)
        {
            let salt = getSalt();
            player.call('addedAccount');
            players[ind].push({"nickname": `${nickname}`, "password": `${passwordHashing(password, salt)}`, "salt": `${salt}`, "question": `${question}`, "answer": `${answer}`, "money": 0, "carLineRecord": 0, "driftRecord": 0, "vehicles": []});
            player.call('addedAccountFinally');
            fs.writeFileSync("packages/0dimension/players.json", JSON.stringify(players), "utf-8");
            return;
        }
        if (players[ind].length == 1)
        {
            if (nickname == players[ind][0].nickname)
            {
                player.call('incorrectNickname');
                return;
            }
            if (nickname < players[ind][0].nickname)
            {
                let salt = getSalt();
                player.call('addedAccount');
                players[ind].splice(0, 0, {"nickname": `${nickname}`, "password": `${passwordHashing(password, salt)}`, "salt": `${salt}`, "question": `${question}`, "answer": `${answer}`, "money": 0, "carLineRecord": 0, "driftRecord": 0, "vehicles": []});
                player.call('addedAccountFinally');
                fs.writeFileSync("packages/0dimension/players.json", JSON.stringify(players), "utf-8");
            }
            else
            {
                let salt = getSalt();
                player.call('addedAccount');
                players[ind].push({"nickname": `${nickname}`, "password": `${passwordHashing(password, salt)}`, "salt": `${salt}`, "question": `${question}`, "answer": `${answer}`, "money": 0, "carLineRecord": 0, "driftRecord": 0, "vehicles": []});
                player.call('addedAccountFinally');
                fs.writeFileSync("packages/0dimension/players.json", JSON.stringify(players), "utf-8");
            }
            return;
        }
        let left = 0, right = players[ind].length, mid;
        while (right - left > 1)
        {
            mid = (right + left - (right + left) % 2) / 2;
            if (players[ind][mid].nickname > nickname)
                right = mid;
            else
                left = mid;
        }
        if (players[ind][left].nickname == nickname)
        {
            player.call('incorrectNickname');
            return;
        }
        let salt = getSalt();
        player.call('addedAccount');
        players[ind].splice(left, 0, {"nickname": `${nickname}`, "password": `${passwordHashing(password, salt)}`, "salt": `${salt}`, "question": `${question}`, "answer": `${answer}`, "money": 0, "carLineRecord": 0, "driftRecord": 0, "vehicles": []});
        player.call('addedAccountFinally');
        fs.writeFileSync("packages/0dimension/players.json", JSON.stringify(players), "utf-8");
    }, 750);
});
