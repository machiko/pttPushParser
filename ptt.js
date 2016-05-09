var request = require('request');
var cheerio = require('cheerio');
var schema = require('./models.js');


var getLinkInContent = function(item) {
    var content = item.content;
    var picture = item.picture;
    var newPicture = [];
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    if (content.match(urlRegex)) {
        newPicture.push.apply(newPicture, picture);
        newPicture.push.apply(newPicture, content.match(urlRegex));
        item.picture = newPicture;
    }
    return item;
};


function addToDB(item, collection) {
    collection.push(item);
}


function runFetch (article, callback) {
    console.log("target: " + article);
    var run = request(article, function(error, response, body) {
        if(error) {
            console.log("Error: " + error);
        }
        console.log("Status code: " + response.statusCode);
        var $ = cheerio.load(body);
        var collection = [];
        $('#main-content > div.push').each(function() {
            var item = new schema.schema();
            item.tag = $(this).find('span.push-tag').text().trim();
            item.content = $(this).find('span.push-content').text().trim();
            item.userid = $(this).find('span.push-userid').text().trim();
            item.picture = [];
            item.picture.push($(this).next('div.richcontent').find('img').attr('src'));
            item = getLinkInContent(item);
            addToDB(item, collection);
        });
        callback(collection);
    });
}

module.exports = runFetch;
