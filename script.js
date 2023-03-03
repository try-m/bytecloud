const tariffBunny = document.querySelectorAll('.tariff-bunny');
const tariffScaleway = document.querySelectorAll('.tariff-scaleway');
const arrOfRadios = [tariffBunny, tariffScaleway];

function renderGb(input) {
    let outputId = input.id.split('input-').join('');
    outputId = outputId + "-number";
	document.getElementById(outputId).innerHTML = input.value;
}

//data coming form server
const data = [
    {
        "id": 1,
        "name": "backblaze",
        "storagePrice": 0.005,
        "transferPrice": 0.01,
        "minGB": null,
        "minPayment": 7,
        "maxPayment": null
    },
    {
        "id": 2,
        "name": "bunny",
        "storagePrice": {
            "hdd": 0.01,
            "ssd": 0.02
        },
        "transferPrice": 0.01,
        "minGB": null,
        "minPayment": null,
        "maxPayment": 10
    },
    {
        "id": 3,
        "name": "scaleway",
        "storagePrice": {
            "multi": 0.06,
            "single": 0.03
        },
        "transferPrice": 0.02,
        "minGB": 75,
        "minPayment": null,
        "maxPayment": null
    },
    {
        "id": 4,
        "name": "vultr",
        "storagePrice": 0.01,
        "transferPrice": 0.01,
        "minGB": null,
        "minPayment": 5,
        "maxPayment": null
    }
]

//check tariffs
const HDD = "hdd";
const SSD = "ssd";
const MULTI = "multi";
const SINGLE = "single";

class Website {
    constructor ({ id, name, storagePrice, transferPrice, minGB, minPayment, maxPayment }) {
        this.id = id;
        this.name = name;
        this.storagePrice = storagePrice;
        this.transferPrice = transferPrice;
        this.minGB = minGB;
        this.minPayment = minPayment;
        this.maxPayment = maxPayment;
        if (typeof storagePrice === "object") {
            this.tariff = Object.keys(storagePrice)[0];
        } else {
            this.tariff = null;
        }
        
        this.price;
    }
    getName = () => {
        return this.name;
    }

    setPrice = (storage, transfer) => {
        let pricePerStorage = this.storagePrice;

        if (this.minGB) {
            [storage, transfer] = this.decrementMinGB([storage, transfer], this.minGB)
        }

        switch(this.tariff){
            case HDD: 
                pricePerStorage = this.storagePrice.hdd;
                break;
            case SSD:
                pricePerStorage = this.storagePrice.ssd;
                break;
            case MULTI:
                pricePerStorage = this.storagePrice.multi;
                break;
            case SINGLE:
                pricePerStorage = this.storagePrice.single;
                break;
        }

        this.price = (storage * pricePerStorage) + (transfer * this.transferPrice);
        
        if (this.minPayment && this.price < this.minPayment) {
            this.price = this.minPayment;
        }
        if (this.maxPayment && this.price > this.maxPayment) {
            this.price = this.maxPayment;
        }
    }

    decrementMinGB = (arrGB, min) => {
        return arrGB.map(gb => gb < min ? gb = 0 : gb = gb - min);
    }

    getPrice = () => {
        return this.price;
    }

    setMinGB = (num) => {
        this.minGB = num;
    }
}

//create array of websites
const arraySites = [];
for (let i = 0; i < data.length; i++) {
    arraySites.push(new Website(data[i]));
}

const inputStorage = document.querySelector('#input-storage');
const inputTransfer = document.querySelector('#input-transfer');
const scales = document.querySelectorAll('.scale');
const arrayPrice = document.querySelectorAll('.price');

function setInnerHTMLAndPrice (website, priceHTML, scaleHTML){
    website.setPrice(inputStorage.value, inputTransfer.value);
    priceHTML.innerHTML = website.getPrice().toFixed(2);
    scaleHTML.style.width = Math.round(website.getPrice() * 4) + 'px';
}

[inputStorage, inputTransfer].forEach(element => {
    element.addEventListener('input', function () {
        scaleWidthArr = []
        for (let i = 0; i < arraySites.length; i++) {
            setInnerHTMLAndPrice(arraySites[i], arrayPrice[i], scales[i]);
            scaleWidthArr.push(Math.round(arraySites[i].getPrice() * 4));
        }
        const minWidth = Math.min(...scaleWidthArr)
        for (const scale of scales) {
            if (parseInt(scale.style.width, 10) === minWidth) {
                scale.style.backgroundColor = '#590591'
            } else {
                scale.style.backgroundColor = '#7e7979'
            }
        }
    })
})

arrOfRadios.forEach(element => {
    element.forEach(input => {
        input.addEventListener('click', function () {
            if (input.checked){
                arraySites.forEach((website, i) => {
                    Object.keys(website.storagePrice).forEach(obj => {
                        if (input.value === obj){
                            website.tariff = obj;
                            setInnerHTMLAndPrice(website, arrayPrice[i], scales[i]);
                        }    
                    })
                })
            }
        })
    })
})