var appPackage = require('./package');
var feu = require('symphony-feu');

module.exports = function(config, pageType, pageData) {
    var feu = require('symphony-feu');

    var accountId = config.accountId;
    var pcUniqueId = 'id';
    var pcUniqueIdOrder = 'productId';

    //config.debug = true;

    Loader("//static.criteo.net/js/ld/ld.js");

    window.criteo_q = window.criteo_q || [];

    feu.whenReady(function() {
        if(typeof $('[ng-controller=AppCtrl]').scope() !== 'undefined' && typeof $('[ng-controller=AppCtrl]').scope().currentUser !== 'undefined') {
            return true;
        }

        return false;
    }).then(function() {
        window.location.pathname == '/' && trackHomepageView();

        //Something is wrong with pageType on store pages
        ($('#storeCarousel').length > 0 || window.location.pathname == '/search') && trackCategoryPage();

        //Something is wrong with pageType on product pages
        $('[ng-controller=ProductCtrl]').length > 0 && trackProductPage();

        window.location.pathname == '/cart' && trackCart();

        /\/order\//.exec(window.location.pathname) && typeof order !== 'undefined' && trackOrder();
    });

    function doLog(message) {
        config.debug && console.log('Criteo debug: '+message);
    }

    function getDeviceType() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            if(/iPad/.test(navigator.userAgent) || $(window).width() > 736) {
                return 't';
            }

            return 'm';
        }

        return 'd';
    }

    function getCurrentUser() {
        var user = $('[ng-controller=AppCtrl]').scope().currentUser;

        return ((user && user.email) || ((window.order && window.order.email) || ''));
    }

    function trackHomepageView() {
        window.criteo_q.push(
            { event: "setAccount", account: accountId },
            { event: "setEmail", email: getCurrentUser() },
            { event: "setSiteType", type: getDeviceType() },
            { event: "viewHome" }
        );

        doLog('Tracking homepage view for: '+getCurrentUser()+' with device type: '+getDeviceType()+' for account '+accountId);
    }

    function trackCategoryPage() {
        feu.watch('store', function(productClusters) {
            var pcs = _.map(productClusters, 'id');

            window.criteo_q.push(
                { event: "setAccount", account: accountId },
                { event: "setEmail", email: getCurrentUser() },
                { event: "setSiteType", type: getDeviceType() },
                { event: "viewList", item:pcs }
            );

            doLog('Tracking category view for: '+getCurrentUser()+' with device type: '+getDeviceType()+' for account '+accountId+' with pcs: '+pcs.join(','));
        });
    }

    function trackProductPage() {
        feu.whenReady(function() {
            if(typeof $('[ng-controller=ProductCtrl]').scope() !== 'undefined') {
                return $('[ng-controller=ProductCtrl]').scope().pc;
            }

            return false;
        }).then(function(pc) {
            var id = pc.id;

            window.criteo_q.push(
                { event: "setAccount", account: accountId },
                { event: "setEmail", email: getCurrentUser() },
                { event: "setSiteType", type: getDeviceType() },
                { event: "viewItem", item: id }
            );

            doLog('Tracking product view for: '+getCurrentUser()+' with device type: '+getDeviceType()+' for account '+accountId+' with pc: '+id);
        });
    }

    function trackOrder() {
        var lineItems = [];
        _.each(window.order.items, function(lineItem) {
            lineItems.push({
                id: lineItem.productId,
                price: (lineItem.productPrice).toFixed(2),
                quantity: lineItem.quantity
            });
        });

        window.criteo_q.push(
            { event: "setAccount", account: accountId },
            { event: "setEmail", email: getCurrentUser() },
            { event: "setSiteType", type: getDeviceType() },
            { event: "trackTransaction", id: window.order.id+'', item: lineItems }
        );

        doLog('Tracking category view for: '+getCurrentUser()+' with device type: '+getDeviceType()+' for account '+accountId+' with line items: '+JSON.stringify(lineItems));
    }

    function trackCart() {
        feu.whenReady(function() {
            if(typeof $('[ng-controller=CheckoutBetaCtrl]').scope() !== 'undefined' &&
                $('[ng-controller=CheckoutBetaCtrl]').scope().getCheckoutState('lineItems.regular') &&
                $('[ng-controller=CheckoutBetaCtrl]').scope().getCheckoutState('lineItems.regular').length > 0) {
                return  $('[ng-controller=CheckoutBetaCtrl]').scope().getCheckoutState('lineItems.regular');
            }

            return false;
        }).then(function(cartItems) {
            var lineItems = [];
            _.each(cartItems, function(lineItem) {
                lineItems.push({
                    id: lineItem.variant.id,
                    price: (lineItem.memberPricePerUnit/100.0).toFixed(2),
                    quantity: lineItem.quantity
                });
            });

            window.criteo_q.push(
                { event: "setAccount", account: accountId },
                { event: "setEmail", email: getCurrentUser() },
                { event: "setSiteType", type: getDeviceType() },
                { event: "viewBasket", item: lineItems}
            );

            doLog('Tracking order view for: '+getCurrentUser()+' with device type: '+getDeviceType()+' for account '+accountId+' with line items: '+JSON.stringify(lineItems));
        });
    }

    var thisApp = {
        name: appPackage.name,
        config: config,
        description: appPackage.description,
        url: appPackage.repository.url
    };

    Symphony.activeApps = Symphony.activeApps || [];
    Symphony.activeApps.push(thisApp);
};
