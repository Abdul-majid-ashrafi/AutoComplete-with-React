const express = require('express'),
    mongoose = require("mongoose");
    app = express(),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    exphbs = require('express-handlebars'),
    url = mongoose.connect('mongodb://auto:complete@ds153609.mlab.com:53609/autocomplete');
    ReactDOMServer = require('react-dom/server'),
    React = require('react')
    require('babel-register')({
    presets: ['react']
})

    const Autocomplete = React.createFactory(require('./src/autocomplete.jsx'))
    port = 4000
    mongoose.connection.on('connected', function (err) {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log("Mongoose is connected", port);
    var itemSchema = new mongoose.Schema({
        name: String,
        time: {
            type: Date, default: Date.now
        }
    });
    var itemModel = mongoose.model("rooms", itemSchema);

    app.use(logger('dev'))
    app.use(bodyParser.json())
    app.use(express.static('public'))
    app.engine('handlebars', exphbs())
    app.set('view engine', 'handlebars')

    app.use(function (req, res, next) {
        req.rooms = itemModel
        return next()
    })

    app.post('/rooms', function (req, res, next) {
        var newItem = new itemModel(req.body)
        newItem.save(function (err, result) {
            if (err) return next(err)
            return res.json(result.ops)
        })
    })
    app.get('/', function (req, res, next) {
        var url = 'http://localhost:' + port + '/rooms'
        req.rooms.find({}, function (err, rooms) {
            if (err) return next(err)
            res.render('index', {
                autocomplete: ReactDOMServer.renderToString(Autocomplete({
                    options: rooms,
                    url: url
                }))
                ,
                data: `<script type="text/javascript">
                window.__autocomplete_data = {
                  rooms: ${JSON.stringify(rooms, null, 2)},
                  url: "${url}"
                }
              </script>`
            })
        })
    })
    app.listen(port)
})
