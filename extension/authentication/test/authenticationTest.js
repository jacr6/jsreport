/*globals describe, it, beforeEach, afterEach */

var assert = require("assert"),
    path = require("path"),
    should = require("should"),
    request = require('supertest'),
    describeReporting = require("../../../test/helpers.js").describeReporting;

describeReporting(path.join(__dirname, "../../"), ["express", "authentication"], {
    authentication: { admin : { username: "admin", password: "password"}},
    "cookieSession": {
        "secret": "foo",
        "cookie": { "domain": "local.net" }
    }
}, function(reporter) {

    describe('authentication', function () {

        it("should redirect to login without auth cookie", function(done) {
            request(reporter.options.express.app).get("/")
                .end(function (err, res) {
                    console.log(res.text);
                    res.header.location.should.containEql("/login");
                    done();
                });
        });

        it("should pass with auth cookie", function(done) {

            request(reporter.options.express.app).post('/login')
                .type('form')
                .send({ username: "admin", password:"password" })
                .end(function (err, res) {
                    if (err) return done(err);

                    request(reporter.options.express.app).get("/api/version")
                        .set("cookie", res.headers['set-cookie'])
                        .expect(200, done)
                });
        });

        it("should 401 when calling api without auth header", function(done) {
            request(reporter.options.express.app).get("/api/version")
                .expect(401, done);
        });

        it("should 200 when calling api with auth header", function(done) {
            request(reporter.options.express.app).get("/api/version")
                .set("Authorization", "Basic " + new Buffer("admin:password").toString('base64'))
                .expect(200, done);
        });


    });
});


