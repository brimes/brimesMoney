Api = function() {
    this.host = "localhost:3000";
    this.email = "brunodelima@gmail.com";
    this.token = "132jdh38j73ge234rfwer33f2wwsd";
    this._keyApi = null;
    
    this.startApi = function(callBack) {
        App.enviaRequisicao('http://' + this.host + '/api/start.json', {
            user: {
                email: this.email,
                token: this.token
            }
        }, function(data) {
            this._keyApi = data._id;
            callBack({status: "ok", data: data, api: this})
        }, function(textError, errorThrown, url) {
            callBack({status: "error", api: this})
        });
    };

};
