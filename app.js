var app = {};
app.ajax = function (type, url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(type, url);
    if (type == 'POST') {
        xhr.setRequestHeader("Content-type", "application/json");

        if (typeof data == 'object') {
            data = JSON.stringify(data);
        }
    }
    xhr.send(data);
    xhr.onreadystatechange = function () {
        var DONE = 4;
        if (xhr.readyState === DONE) {
            if (!xhr.responseText)
                callback(null, xhr);
            else
                callback(JSON.parse(xhr.responseText), xhr);
        }
    }
}


app.toggleClass = function (elements, myClass) {
    if (!elements) { return; }
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements.tagName) { elements = [elements]; }
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.toggle(myClass);
    }
}


app.removeClass = function (elements, myClass) {
    if (!elements) { return; }
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements.tagName) { elements = [elements]; }
    var reg = new RegExp('(^| )' + myClass + '($| )', 'g');
    for (var i = 0; i < elements.length; i++) {
        elements[i].className = elements[i].className.replace(reg, ' ');
    }
}

app.addClass = function (elements, myClass) {
    if (!elements) { return; }
    if (typeof (elements) === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements.tagName) { elements = [elements]; }
    for (var i = 0; i < elements.length; i++) {
        if ((' ' + elements[i].className + ' ').indexOf(' ' + myClass + ' ') < 0) {
            elements[i].className += ' ' + myClass;
        }
    }
}


app.render = function (response)
{
    if (response.today) {
        localStorage.cache = JSON.stringify(response);
        document.querySelector("#today-value").innerHTML = "$" + parseFloat(response.today.trm).toLocaleString("us-EN");
        document.querySelector("#today-value2").innerHTML = "$" + parseFloat(response.today.trm).toLocaleString("us-EN");
        document.querySelector("#today-value-text").innerHTML = response.today.text;
        document.querySelector("#today-date").innerHTML = response.today.dateText;
        if (parseFloat(response.today.trm) > parseFloat(response.yesterday.trm)) {
            document.querySelector(".variation").innerHTML = "Subió";
            app.addClass(".variation", "green");
        }
        if (parseFloat(response.today.trm) < parseFloat(response.yesterday.trm)) {
            document.querySelector(".variation").innerHTML = "Bajó";
            app.addClass(".variation", "red");
        }
        document.querySelector(".variation").setAttribute("title", "Ayer " + response.yesterday.dateText + ": $" + parseFloat(response.yesterday.trm).toLocaleString("us-EN"));

        app.renderChart(response.H90);
    }
    app.addClass("#loader", "hide");
}

app.renderChart = function(data)
{
    var dataPrices = [];
    var maxPrice = 0;
    var maxPriceObj = [];
    var minPriceObj = [];
    var minPrice = 99999;
    var maxPriceDate = '';
    var minPriceDate = '';
    var total = 0;
    var prom = 0;
    data.forEach(function (e) {
        dataPrices.push([(new Date(e.date + " 00:00:00")).getTime(), e.trm]);
        if (e.trm > maxPrice) {
            maxPriceDate = e.date;
            maxPrice = e.trm;
            maxPriceObj = [(new Date(e.date + " 00:00:00")).getTime(), e.trm]
        }
        total = total + e.trm;
        if (e.trm < minPrice) {
            minPrice = e.trm;
            minPriceDate = e.date;
            minPriceObj = [(new Date(e.date + " 00:00:00")).getTime(), e.trm]
        }

    });

    prom = (total / dataPrices.length).toFixed(2);
    /*document.querySelector("#maxPrice").innerHTML = "$" + maxPrice.toLocaleString("en-US");
    document.querySelector("#maxPriceDate").innerHTML = humanDate(maxPriceDate);
    document.querySelector("#minPrice").innerHTML = "$" + minPrice.toLocaleString("en-US");
    document.querySelector("#minPriceDate").innerHTML = humanDate(minPriceDate);
    document.querySelector("#promPrice").innerHTML = "$" + parseFloat(prom).toLocaleString("en-US");*/


    Highcharts.chart('chart_div', {
        title: {
            text: ""
        },

        subtitle: {
            text:  'Últimos 90 Días'
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            type: 'currency',
            title: {
                text: ''
            },
            plotLines: [{
                value: minPrice,
                color: 'green',
                dashStyle: 'shortdash',
                width: 1,
                zindex: 99,
                label: {
                    text: ''
                }
            },
            {
                value: prom,
                color: 'gray',
                dashStyle: 'shortdash',
                width: 1,
                zindex: 99,
                label: {
                    text: ''
                }
            },
            {
                value: maxPrice,
                color: 'red',
                dashStyle: 'shortdash',
                width: 1,
                zindex: 99,
                label: {
                    text: ''
                }
            }],

            labels: {
                formatter: function () {
                    return '$' + this.value.toLocaleString('en-US');
                }
            }
        },
        legend: {
            enabled: false
        },
        exporting: { enabled: false },


        tooltip: {
            formatter: function () {
                return '<b>Fecha:</b> ' + new Date(this.x).toISOString().split('T')[0] + '<br><b>Precio del Dólar: $' + this.y.toLocaleString('en-US') + '</b>';
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            color: '#1565C0',
            type: 'line',
            name: ' ',
            data: dataPrices
        }]
    });
}

if (localStorage.cache) {
    try {
        var response = JSON.parse(localStorage.cache);
        app.render(response);
        console.log("Using cache", response);
    } catch (e) {
        console.log("Error Cache", e);
    }
}
app.ajax("GET", "https://www.dolarcolombia.co/api/get", false, function (response) {
    app.render(response);

});