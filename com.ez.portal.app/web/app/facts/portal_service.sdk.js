/**
 * 
 */
(function (ctx, fn) {
    'use strict';
    fn(ctx);
})(this, function (ctx) {
    'use strict';
    var portalHttpServiceProvider = PortalHttpServiceProvider.prototype,
    portalHttpService;
    
    angular
        .module('portal_service.sdk', [])
        .service('portal_interceptor.srvc', [
           '$rootScope',
           '$cookies',
           portalInterceptorService
        ])
        .provider('$portalHttpService', [
            PortalHttpServiceProvider
        ]);
    
    portalHttpServiceProvider.setDomain = function (domain) {
        portalHttpService.domain = domain;
        return this;
    };
    
    portalHttpServiceProvider.setPort = function (port) {
        portalHttpService.port = port;
        return this;
    };
    
    portalHttpServiceProvider.setSecure = function (flag) {
        portalHttpService.secure = flag;
        return this;
    };
    
    portalHttpServiceProvider.setAppCtx = function (appCtx) {
        portalHttpService.appCtx = appCtx;
        return this;
    };
    
    portalHttpServiceProvider.setBaseUrl = function (baseUrl) {
        portalHttpService.baseUrl = baseUrl;
        return this;
    };
    
    portalHttpServiceProvider.addUrl = function (key, value) {
        portalHttpService.Url[key] = value;
        return this;
    };
    
    function portalInterceptorService ($rootScope, $cookies) {
        var portalInterceptorService = this;
        portalInterceptorService.request = function (config) {
            $rootScope.$broadcast('portal.handle_loader', true);
            if (portalInterceptorService.loggedInUser 
                    && portalInterceptorService.loggedInUser.shardKey) {
                config.headers['US-KEY'] = portalInterceptorService.loggedInUser.shardKey;
                config.headers['AUTH-TOKEN'] = $cookies.get('a_token');
            } else {
                delete config.headers['AUTH-TOKEN'];
                delete config.headers['US-KEY'];
            }
            return config;
        };
        portalInterceptorService.requestError = function (rejection) {
            $rootScope.$broadcast('portal.handle_loader', false);
            return rejection;
        };
        portalInterceptorService.response = function (config) {
            $rootScope.$broadcast('portal.handle_loader', false);
            return config;
        };
        portalInterceptorService.responseError = function (rejection) {
            $rootScope.$broadcast('portal.handle_loader', false);
            return rejection;
        };
    }
    
    function PortalHttpServiceProvider() {
        var portalHttpServiceProto = PortalHttpService.prototype;
        
        portalHttpService = new PortalHttpService();
        
        this.$get = ['$http', function ($http) {
            portalHttpService.$http = $http;
            return portalHttpService;
        }];
        
        portalHttpServiceProto.get = function (url) {
            var portalHttpService = this;
            return portalHttpService.$http({
                method: 'GET',
                url: portalHttpService.buildUrl(url)
            });
        };
        
        portalHttpServiceProto.getJson = function (url) {
            var portalHttpService = this;
            return portalHttpService.$http({
                method: 'GET',
                url: url
            });
        };
        
        portalHttpServiceProto.post = function (url, reqData) {
            var portalHttpService = this;
            return portalHttpService.$http({
                method: 'POST',
                url: portalHttpService.buildUrl(url),
                data: reqData
            });
        };
        
        portalHttpServiceProto.buildUrl = function (url) {
            var portalHttpService = this, 
            urlToken = url.split('/'), 
            urlKey = urlToken.shift(), absoluteUrl;
            
            absoluteUrl = (portalHttpService.secure ? 'https' : 'http') + '://' 
                + portalHttpService.domain + ':'
                + (portalHttpService.port || '') + '/' 
                + portalHttpService.appCtx + '/'
                + portalHttpService.baseUrl + '/'
                + urlKey
                + (urlToken.length ? '/' : '');
            
            absoluteUrl += urlToken.join('/');
            return absoluteUrl;
        };
        
        function PortalHttpService($http) {
            this.$http = $http;
            this.domain = 'localhost';
            this.port = '8080';
            this.appCtx = 'app';
            this.secure = false;
            this.Url = {};
        }
        
    }
});