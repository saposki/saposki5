var http = require('http');
var form = require('body/any');
var ecstatic = require('ecstatic');
var st = ecstatic(__dirname + '/..');
var hy = require('hyperstream');
var through = require('through2');
var fs = require('fs');

var level = require('level');
var db = level(__dirname + '/data.db', {
    valueEncoding: 'json'
});

var server = http.createServer(function (req, res) {
    if (req.method === 'POST' && req.url === '/contact') {
        form(req, res, function (err, body) {
            db.put(new Date().toISOString(), body, function (err) {
                if (err) res.end(err + '\n')
                else res.end('thanks for your comments!')
            });
        });
    }
    else if (req.url === '/list-comments') {
        var stream = through();
        var hs = hy({'.mycontent':stream});
        fs.createReadStream(__dirname + '/../comments.html').pipe(hs).pipe(res);
        var s = db.createReadStream();
        s.on('data', function (row) {
            stream.write(JSON.stringify(row) + '\n');
        });
        s.on('end', function () {
            stream.end();
        });
    }
    else st(req, res);
});
server.listen(5000);