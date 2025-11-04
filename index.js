import express from 'express';
import http from 'node:http';
import createBareServer from "@tomphttp/bare-server-node";
import path from 'node:path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import ejs from 'ejs';
import axios from 'axios';
import miniget from 'miniget';
import bodyParser from 'body-parser';

const __dirname = process.cwd();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer('/bare/')
const PORT = 8080;
const limit = process.env.LIMIT || 50;
const user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15";
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
    secret: 'wakamedayoooooooooooharusameeeeeee',
    resave: false,
    saveUninitialized: true
}));

//ログイン
// 読み込み時ちぇっく
app.use((req, res, next) => {
    if (req.cookies.massiropass !== 'ok' && !req.path.includes('login')) {
        return res.redirect('/login');
    } else {
        next();
    }
});

app.use(express.static(path.join(__dirname, 'public')));

//ログイン済み？
app.get('/login/if', async (req, res) => {
    if (req.cookies.massiropass !== 'ok') {
        res.render('../login/login.ejs', { error: 'ログインしていません。もう一度ログインして下さい' })
    } else {
        return res.redirect('/');
    }
});
// ログインページ
app.get('/login', (req, res) => {
    res.render('../login/login.ejs', { error: null });
});
// パスワード確認
app.post('/login', (req, res) => {
    const password = req.body.password;
    if (password === 'massiro') {
        res.cookie('massiropass', 'ok', { maxAge: 5 * 24 * 60 * 60 * 1000, httpOnly: true });
        
        return res.redirect("/");
    } else {
        if (password === 'ohana') {
            return res.redirect('https://ohuaxiehui.webnode.jp');
        } else {
            res.render('../login/login.ejs', { error: 'パスワードが間違っています。もう一度お試しください。' });
        }
    }
});
//パスワードを忘れた場合
app.get('/login/forgot', (req, res) => {
  res.render(`../login/forgot.ejs`);
});
//ログアウト
app.post('/logout', (req, res) => {
    res.cookie('massiropass', 'false', { maxAge: 0, httpOnly: true });
    return res.redirect('/login');
});
//cookie
function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers.cookie;

    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            let parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }

    return list;
}

const routes = [
  { path: '/', file: 'index.html' },
  { path: '/news', file: 'apps.html' },
  { path: '/send', file: 'send.html' },
  { path: '/local-news', file: 'tabs.html' },
  { path: '/tools', file: 'tool.html' },
  { path: '/image-galleries', file: 'go.html' },
]

app.get('/image-galleries', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'go.html'));
});

// Existing code
//リダイレクト
app.get('/redirect', (req, res) => {
  const subp = req.query.p;
  const id= req.query.id;
  if (id) {
    res.redirect(`/${subp}/${id}`);
  } else {
    res.redirect(`/${subp}`);
  }
});

server.on('request', (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.on('listening', () => {
  console.log(`Running at http://localhost:${PORT}`);
});

server.listen({
  port: PORT,
});
