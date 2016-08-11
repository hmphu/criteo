# Symphony Commerce / Criteo

`accountId` is available in the install code in the integrate.criteo.com UI

Please contact your Criteo representative to get the 4-digit account ID and / or integration.criteo.com login

Tracks: 
all pages - user email 
/cart - sends line item variant IDs
/order/\d+ - sends line item variant IDs
product page view - sends product cluster ID
PLP - sends product cluster IDs

Update `apps.json`:
```
"all-pages": {
    "criteo": {
        "config": {
            "accountId" : accountId
        },
        "active": true
    }
}
```
