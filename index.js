var appPackage = require('./package');
var feu = require('symphony-feu');

module.exports = function(config, pageType, pageData) {
    var feu = require('symphony-feu');

    var accountId = config.accountId;
    var pcUniqueId = 'id';

    Loader("//static.criteo.net/js/ld/ld.js");

    window.criteo_q = window.criteo_q || [];

    feu.whenReady(function() {
        if(typeof $('[ng-controller=AppCtrl]').scope() !== 'undefined') {
            return true;
        }

        return false;
    }).then(function() {
        window.location.pathname == '/' && trackHomepageView();
        pageType == 'store' && trackCategoryPage();
        pageType == 'product' && trackProductPage();
        pageType == 'cart' && trackCart();
        pageType == 'order' && trackOrder();
    });

    function getDeviceType() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            if(/iPad/.text(navigator.userAgent) || $(window).width() > 736) {
                return 't';
            }

            return 'm';
        }

        return 'd';
    }

    function getCurrentUser() {
        var user = $('[ng-controller=AppCtrl]').scope().currentUser;

        return ((currentUser && currentUser.email) || '');
    }

    function trackHomepageView() {
        window.criteo_q.push(
            { event: "setAccount", account: accountId },
            { event: "setEmail", email: getCurrentUser() },
            { event: "setSiteType", type: getDeviceType() },
            { event: "viewHome" }
        );
    }

    function trackCategoryPage() {
        feu.watch('store', function(productClusters) {
            var pcs = _.map(productClusters, pcUniqueId);

            window.criteo_q.push(
                { event: "setAccount", account: accountId },
                { event: "setEmail", email: getCurrentUser() },
                { event: "setSiteType", type: getDeviceType() },
                { event: "viewList", item:pcs }
            );
        });
    }

    function trackProductPage() {
        feu.whenReady(function() {
            if(typeof $('[ng-controller=ProductCtrl]').scope() !== 'undefined') {
                return $('[ng-controller=ProductCtrl]').scope().pc;
            }

            return false;
        }).then(function(pc) {
            var id = pc[pcUniqueId];

            window.criteo_q.push(
                { event: "setAccount", account: accountId },
                { event: "setEmail", email: getCurrentUser() },
                { event: "setSiteType", type: getDeviceType() },
                { event: "viewItem", item: id }
            );
        });
    }

    function trackOrder() {
        var lineItems = [];
        _.each(order.items, function(lineItem) {
            lineItems.push({
                id: lineItem.productClusterId,
                price: (lineItem.productPrice).toFixed(2),
                quantity: lineItem.quantity
            });
        });

        window.criteo_q.push(
            { event: "setAccount", account: accountId },
            { event: "setEmail", email: getCurrentUser() },
            { event: "setSiteType", type: getDeviceType() },
            { event: "trackTransaction", id: order.id+'', item: lineItems }
        );
    }

    function trackCart() {
        feu.whenReady(function() {
            if(typeof $('[ng-controller=CheckoutCtrl]').scope() !== 'undefined') {
                return $('[ng-controller=CheckoutCtrl]').scope().cart;
            }

            return false;
        }).then(function(cart) {
            var lineItems = [];
            _.each(cart.lineItems, function(lineItem) {
                lineItems.push({
                    id: lineItem[pcUniqueId],
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
}