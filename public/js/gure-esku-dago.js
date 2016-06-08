(function() {
    "use strict";

    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    function eskalatu() {

        var jatorrizko_zabalera = 680;
        var zabalera = window.innerWidth;
        var altuera = window.innerHeight;

        var eskala = 1;

        // Pantailaren zabalera maparena baino txikiagoa bada.
        if (zabalera < jatorrizko_zabalera) {

            // Eskala kalkulatu.
            eskala = zabalera / jatorrizko_zabalera - 0.04;

        }

        document.getElementById("kontainerra").style["transform-origin"] = "top left";
        document.getElementById("kontainerra").style.transform = "scale(" + eskala + ")";

        return eskala;

    }

    function bistaratuHerriarenEmaitzenGrafikoa(id, botoa_emandakoak, bai, ez, bai_kolorea, ez_kolorea) {

        var max = bai;

        if (ez > bai) {
            max = ez;
        }

        var grafikoa = c3.generate({
            bindto: id,
            size: {
                height: 150,
                width: 224
            },
            legend: {
                hide: true
            },
            transition: {
                duration: 200
            },
            data: {
                columns: [
                    ["bai", bai],
                    ["ez", ez]
                ],
                type: "bar",
                colors: {
                    "bai": bai_kolorea,
                    "ez": ez_kolorea
                },
                labels: {
                    format: {
                        "bai": function(v, id, i, j) {
                            return v;
                        },
                        "ez": function(v, id, i, j) {
                            return v;
                        }
                    }
                }
            },
            axis: {
                x: {
                    show: false
                },
                y: {
                    max: max,
                    show: false
                }
            },
            tooltip: {
                format: {
                    title: function(d) {
                        return "Botoak guztira";
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.5
                }
            }
        });

    }

    function bistaratuHerrienDatuenTaula(datuak) {

        var katea = "";

        datuak.filter(function(element, index, array) {
            return (element.botoa_emandakoak > 0);
        }).sort(function(a, b) {
            return (a.euskarazko_izena > b.euskarazko_izena);
        }).forEach(function(element, index, array) {

            var guztira = element.bai + element.ez + element.zuria + element.baliogabea;

            katea = katea +
                "<tr>" +
                    "<td>" + element.euskarazko_izena + "</td>" +
                    "<td>" + element.hautesleak + "</td>" +
                    "<td>" + element.botoa_emandakoak + "</td>" +
                    "<td>%" + element.partehartzea + "</td>" +
                    "<td>" + element.bai + "</td>" +
                    "<td>%" + kalkulatuEhunekoa(element.bai, guztira, 2) + "</td>" +
                    "<td>" + element.ez + "</td>" +
                    "<td>%" + kalkulatuEhunekoa(element.ez, guztira, 2) + "</td>" +
                    "<td>" + element.zuria + "</td>" +
                    "<td>%" + kalkulatuEhunekoa(element.zuria, guztira, 2) + "</td>" +
                    "<td>" + element.baliogabea + "</td>" +
                    "<td>%" + kalkulatuEhunekoa(element.baliogabea, guztira, 2) + "</td>" +
                "</tr>";
        });

        var tbody = document.querySelector(".emaitzak-herriz-herri tbody");

        tbody.innerHTML = katea;
    }

    function marraztuBiztanleriaVsGrafikoa(hautatzailea, data, gakoa_x, gakoa_y, tooltip_etiketa_x, tooltip_etiketa_y, kolorea) {

        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 685 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        /*
         * value accessor - returns the value to encode for a given data object.
         * scale - maps value to a visual display encoding, such as a pixel position.
         * map function - maps from data value to display value
         * axis - sets up axis
         */

        // setup x
        var xValue = function(d) { return d[gakoa_x];}, // data -> value
            xScale = d3.scale.linear().range([0, width]), // value -> display
            xMap = function(d) { return xScale(xValue(d));}, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        var yValue;

        // setup y
        if (gakoa_y === "partehartzea" || gakoa_y === "langabezia_tasa_2014" || gakoa_y === "biztanleria2014") {

            yValue = function(d) {
                return d[gakoa_y];
            };

        } else {

            yValue = function(d) {
                return (100 * d[gakoa_y] / (d.bai + d.ez + d.zuria + d.baliogabea)).toFixed(2);
            };

        }

        var yScale = d3.scale.linear().range([height, 0]), // value -> display
            yMap = function(d) { return yScale(yValue(d));}, // data -> display
            yAxis = d3.svg.axis().scale(yScale).orient("left");

        // add the graph canvas to the body of the webpage
        var svg = d3.select(hautatzailea).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add the tooltip area to the webpage
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-biztanleria-vs")
            .style("opacity", 0);

        var datuak = data.filter(function(element, index, array) {
            return element.partehartzea;
        });

        if (gakoa_x === "biztanleria2014") {

            // don't want dots overlapping axis, so add in buffer to data domain
            xScale.domain([0, d3.max(datuak, xValue) + 1000]);

        } else if (gakoa_x === "langabezia_tasa_2014"){

            xScale.domain([0, 30]);

        }

        if (gakoa_y === "biztanleria2014") {

            yScale.domain([0, d3.max(datuak, yValue) + 1000]);

        } else if (gakoa_y === "langabezia_tasa_2014"){

            yScale.domain([0, 30]);

        } else {

            yScale.domain([0, 100]);

        }

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", 28)
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text(tooltip_etiketa_x);

        // y-axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -38)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text(tooltip_etiketa_y);

        // draw dots
        svg.selectAll(".dot")
            .data(datuak)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", kolorea)
            .on("mouseover", function(d) {
                console.log(d);
                tooltip.transition()
                     .duration(200)
                     .style("opacity", 1);
                tooltip.html("<div class='izenburua'>" + d.euskarazko_izena + "</div>" +
                             "<table>" +
                                "<tr>" +
                                    "<td>" + tooltip_etiketa_x + "</td>" +
                                    "<td>" + xValue(d) + "</td>" +
                                "</tr>" +
                                "<tr>" +
                                    "<td>" + tooltip_etiketa_y + "</td>" +
                                    "<td>%" + yValue(d) + "</td>" +
                                "</tr>" +
      	                     "</table>")
                     .style("top", (d3.event.pageY - 28) + "px");

                // Arrasateren tooltip-a pantailatik ateratzen da bestela.
                if (d.euskarazko_izena !== "Arrasate") {
                    tooltip.style("left", (d3.event.pageX + 15) + "px");
                } else {
                    tooltip.style("left", (d3.event.pageX - 215) + "px");
                }
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                     .duration(500)
                     .style("opacity", 0);
            });
    }

    function kalkulatuEhunekoa(balioa, guztira, hamartarrak) {

        return (100 * balioa / guztira).toFixed(hamartarrak).replace(/\./g, ',');

    }

    function onMouseOut(d) {

        tip.hide();

    }

    function onMouseOver(d) {

        tip.html(function(d) {

            var guztira = d.properties.datuak.bai + d.properties.datuak.ez + d.properties.datuak.zuria + d.properties.datuak.baliogabea;

            var katea = "";

            if (d.properties.datuak.partehartzea) {

                katea = "<div class='herria'><strong>" + d.properties.datuak.euskarazko_izena + "</strong></div>" +
                            "<div class='data'>" + d.properties.datuak.data + "</div>" +
                            "<div id='tip-grafikoa'></div>" +
                            "<div class='galdera'><strong>" + d.properties.datuak.galdera + "</strong></div>" +
                            "<div class='partehartzea'><strong>Partehartzea:</strong> %" + d.properties.datuak.partehartzea + "</div>" +
                            "<table class='emaitzak'>" +
                                "<thead>" +
                                    "<tr>" +
                                        "<th></th>" +
                                        "<th>Botoak</th>" +
                                        "<th>Ehunekoa</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tr>" +
                                    "<td>Bai</td>" +
                                    "<td>" + d.properties.datuak.bai + "</td>" +
                                    "<td>%" + kalkulatuEhunekoa(d.properties.datuak.bai, guztira, 2) + "</td>" +
                                "</tr>" +
                                "<tr>" +
                                    "<td>Ez</td>" +
                                    "<td>" + d.properties.datuak.ez + "</td>" +
                                    "<td>%" + kalkulatuEhunekoa(d.properties.datuak.ez, guztira, 2) + "</td>" +
                                "</tr>" +
                                "<tr>" +
                                    "<td>Zuriak</td>" +
                                    "<td>" + d.properties.datuak.zuria + "</td>" +
                                    "<td>%" + kalkulatuEhunekoa(d.properties.datuak.zuria, guztira, 2) + "</td>" +
                                "</tr>" +
                                "<tr>" +
                                    "<td>Baliogabeak</td>" +
                                    "<td>" + d.properties.datuak.baliogabea + "</td>" +
                                    "<td>%" + kalkulatuEhunekoa(d.properties.datuak.baliogabea, guztira, 2) + "</td>" +
                                "</tr>" +
                            "</table>";

            } else if (d.properties.datuak.data) {

                katea = "<div class='herria'><strong>" + d.properties.datuak.euskarazko_izena + "</strong></div>" +
                        "<div class='data'>Galdeketaren data: " + d.properties.datuak.data + "</div>";

            } else {

                katea = "<div class='herria'><strong>" + d.properties.datuak.euskarazko_izena + "</strong></div>" +
                        "<div class='data'>Oraindik ez da zehaztu galdeketaren data.</div>";
            }

            return katea;

        });

        tip.show(d);
    }

    var eskala = eskalatu();

    var aukerak = {
        kolore_mapa: {
            zabalera: 680,
            altuera: 550,
            proiekzioa: {
                erdia: {
                    lat: -2.05,
                    lng: 42.75
                },
                eskala: 13500
            }
        },
        sinbolo_proportzionalen_mapa: {
            zabalera: 680,
            altuera: 550,
            proiekzioa: {
                erdia: {
                    lat: -2.05,
                    lng: 42.75
                },
                eskala: 13500
            }
        },
        emaitzakCSV: "csv/udalerriak.csv",
        topoJSON: "topoJSON/udalerriak.json",
        json_izena: "udalerriak",
        koloreak: {
            bai: "#a6ce39",
            ez: "#c4161c",
            lehenetsia: "#ffffff",
            galdeketa_iragarria: "#0DA0AC"
        }
    };

    // Kolore-maparen proiekzioaren xehetasunak.
    var kolore_maparen_proiektzioa = d3.geo.mercator()
        .center([aukerak.kolore_mapa.proiekzioa.erdia.lat, aukerak.kolore_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.kolore_mapa.proiekzioa.eskala)
        .translate([aukerak.kolore_mapa.zabalera / 2, aukerak.kolore_mapa.altuera / 2]);

    // Sinbolo proportzionalen maparen proiekzioaren xehetasunak.
    var sinbolo_proportzionalen_maparen_proiektzioa = d3.geo.mercator()
        .center([aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lat, aukerak.sinbolo_proportzionalen_mapa.proiekzioa.erdia.lng])
        .scale(aukerak.sinbolo_proportzionalen_mapa.proiekzioa.eskala)
        .translate([aukerak.sinbolo_proportzionalen_mapa.zabalera / 2, aukerak.sinbolo_proportzionalen_mapa.altuera / 2]);

    // Kolore-maparen bidearen generatzailea.
    var kolore_maparen_bidea = d3.geo.path()
        .projection(kolore_maparen_proiektzioa);

    // Sinbolo proportzionalen maparen bidearen generatzailea.
    var sinbolo_proportzionalen_maparen_bidea = d3.geo.path()
        .projection(sinbolo_proportzionalen_maparen_proiektzioa);

    // Maparen svg elementua eskuratu eta neurriak ezarri.
    var svg = d3.select("#mapa svg")
        .attr("width", aukerak.kolore_mapa.zabalera)
        .attr("height", aukerak.kolore_mapa.altuera);

    // Sinbolo proportzionalen maparen svg elementua eskuratu eta neurriak ezarri.
    var sinbolo_proportzionalen_svg = d3.select("#sinbolo-proportzionalen-mapa svg")
        .attr("width", aukerak.sinbolo_proportzionalen_mapa.zabalera)
        .attr("height", aukerak.sinbolo_proportzionalen_mapa.altuera);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .scale(eskala)
        .html("")
        .direction('s')
        .offset([0, 0]);

    var herriak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        guztira: 0
    };

    var biztanleak = {
        alde: 0,
        aurka: 0,
        erabakitzeke: 0,
        guztira: 0
    };

    // Emaitzen datuak irakurri dagokion CSVtik.
    d3.csv(aukerak.emaitzakCSV, function(error, emaitzak) {
        console.log(emaitzak);
        if (error) {
            return console.error(error);
        }

        // Datu geografikoak irakurri dagokion topoJSONetik.
        d3.json(aukerak.topoJSON, function(error, geodatuak) {

            if (error) {
                return console.error(error);
            }
            console.log(geodatuak);

            // Emaitzak eta topoJSON-a bateratzeko ideia hemendik hartu dut, behar bada badago modu hobe bat.
            // http://stackoverflow.com/questions/22994316/how-to-reference-csv-alongside-geojson-for-d3-rollover

            // HELEPeko udalerri bakoitzeko datuak dagokion mapako elementuarekin lotu.
            // d: Emaitzen arrayko udalerri bakoitzaren propietateak biltzen dituen objektua.
            // i: indizea
            emaitzak.forEach(function(d, i) {

                // e: Datu geografikoetako udalerriaren propietateak
                // j: indizea
                topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features.forEach(function(e, j) {

                    if (d.lurralde_kodea === e.properties.ud_kodea) {

                        // Udalerri honetako datuak mapako bere elementuarekin lotu.
                        e.properties.datuak = d;

                        // Balio batzuk string-etik int edo float-era bihurtu behar dira.
                        e.properties.datuak.biztanleria2014 = parseInt(e.properties.datuak.biztanleria2014.replace(/\./, ""), 10);
                        e.properties.datuak.botoa_emandakoak = parseInt(e.properties.datuak.botoa_emandakoak.replace(/\./, ""), 10);
                        e.properties.datuak.partehartzea = parseFloat(e.properties.datuak.partehartzea.replace(",", "."));
                        e.properties.datuak.bai = parseInt(e.properties.datuak.bai.replace(/\./, ""), 10);
                        e.properties.datuak.ez = parseInt(e.properties.datuak.ez.replace(/\./, ""), 10);
                        e.properties.datuak.zuria = parseInt(e.properties.datuak.zuria.replace(/\./, ""), 10);
                        e.properties.datuak.baliogabea = parseInt(e.properties.datuak.baliogabea.replace(/\./, ""), 10);
                        e.properties.datuak.langabezia_tasa_2014 = parseFloat(e.properties.datuak.langabezia_tasa_2014.replace(/,/, "."));

                        if (d.emaitza === "bai") {

                            herriak.alde++;
                            biztanleak.alde = biztanleak.alde +e.properties.datuak.bai;
                            biztanleak.aurka = biztanleak.aurka + e.properties.datuak.ez;

                        } else if (d.emaitza === "ez") {

                            herriak.aurka++;
                            biztanleak.alde = biztanleak.alde + e.properties.datuak.bai;
                            biztanleak.aurka = biztanleak.aurka + e.properties.datuak.ez;

                        } else {

                            herriak.erabakitzeke++;
                            biztanleak.erabakitzeke = biztanleak.erabakitzeke + e.properties.datuak.biztanleria2014;

                        }

                        biztanleak.guztira = biztanleak.guztira + e.properties.datuak.biztanleria2014;

                        herriak.guztira++;
                    }

                });
            });

            console.log(biztanleak.guztira);
            console.log(herriak.guztira);

            var biztanleen_grafikoa = c3.generate({
                bindto: "#biztanleria-grafikoa",
                size: {
                    height: 200,
                    width: 200
                },
                legend: {
                    hide: true
                },
                transition: {
                    duration: 1000
                },
                data: {
                    columns: [
                        ["Alde", biztanleak.alde],
                        ["Aurka", biztanleak.aurka]
                    ],
                    type: "bar",
                    colors: {
                        "Alde": aukerak.koloreak.bai,
                        "Aurka": aukerak.koloreak.ez
                    },
                    labels: {
                        format: {
                            "Alde": function(v, id, i, j) {
                                return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            },
                            "Aurka": function(v, id, i, j) {
                                return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            }
                        }
                    }
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        max: (function() {
                            var max = biztanleak.alde;

                            if (biztanleak.aurka > biztanleak.alde) {
                                max = biztanleak.alde;
                            }
                            return max;
                        })(),
                        show: false
                    }
                },
                tooltip: {
                    format: {
                        title: function(d) {
                            return "Botoak guztira";
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5
                    }
                }
            });

            var herrien_grafikoa = c3.generate({
                bindto: "#herriak-grafikoa",
                size: {
                    height: 200,
                    width: 200
                },
                legend: {
                    hide: true
                },
                transition: {
                    duration: 1000
                },
                data: {
                    columns: [
                        ["Alde", herriak.alde],
                        ["Aurka", herriak.aurka]
                    ],
                    type: "bar",
                    colors: {
                        "Alde": aukerak.koloreak.bai,
                        "Aurka": aukerak.koloreak.ez
                    },
                    labels: true
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        max: (function() {
                            var max = herriak.alde;

                            if (herriak.aurka > herriak.alde) {
                                max = herriak.alde;
                            }
                            return max;
                        })(),
                        show: false
                    }
                },
                tooltip: {
                    format: {
                        title: function(d) {
                            return "Herriak";
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5
                    }
                }
            });

            // Udal guztiak.
            svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Udalerriko emaitzen arabera koloreztatuko dugu.
                    if (d.properties.datuak) {

                        if (d.properties.datuak.emaitza) {

                            // Emaitza aldekoa bada...
                            if (d.properties.datuak.emaitza === "bai") {

                                return aukerak.koloreak.bai;

                            // Kontrakoa bada berriz...
                            } else {

                                return aukerak.koloreak.ez;

                            }
                        } else if (d.properties.datuak.data) {

                            return aukerak.koloreak.galdeketa_iragarria;

                        }
                    }

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "unitatea_" + d.properties.ud_kodea; })
                .attr("d", kolore_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d);
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", d.properties.datuak.botoa_emandakoak, d.properties.datuak.bai, d.properties.datuak.ez, aukerak.koloreak.bai, aukerak.koloreak.ez);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a === b; }))
                .attr("d", kolore_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a !== b; }))
                .attr("d", kolore_maparen_bidea)
                .attr("class", "eskualde-mugak");

            // Udal guztiak.
            sinbolo_proportzionalen_svg.selectAll(".unitatea")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("path")
                .attr("fill", function(d) {

                    // Emaitzarik ez badago...
                    return aukerak.koloreak.lehenetsia;

                })
                .attr("class", "unitatea")
                .attr("id", function(d) { return "sinbolo-proportzionalen-unitatea-" + d.properties.ud_kodea; })
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .on("mouseover", function(d) {
                    onMouseOver(d);
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", d.properties.datuak.botoa_emandakoak, d.properties.datuak.bai, d.properties.datuak.ez, aukerak.koloreak.bai, aukerak.koloreak.ez);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                })
                .call(tip);

            // Kanpo-mugak (a === b)
            sinbolo_proportzionalen_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a === b; }))
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "kanpo-mugak");

            // Unitateak aurreko planora ekarri.
            sinbolo_proportzionalen_svg.selectAll(".unitatea").each(function() {
                var sel = d3.select(this);
                sel.moveToFront();
            });

            // Eskualdeen arteko mugak (a !== b)
            sinbolo_proportzionalen_svg.append("path")
                .datum(topojson.mesh(geodatuak, geodatuak.objects[aukerak.json_izena], function(a, b) { return a !== b; }))
                .attr("d", sinbolo_proportzionalen_maparen_bidea)
                .attr("class", "eskualde-mugak");

            var radius = d3.scale.sqrt()
                .domain([0,
                        d3.max(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features,
                               function(d) {
                                    if (d.properties.datuak) {
                                       return d.properties.datuak.biztanleria2014;
                                    }
                               }
                        )
                ])
                .range([0, 25]);

            sinbolo_proportzionalen_svg.append("g")
                .attr("class", "zirkulua")
                .selectAll("circle")
                .data(topojson.feature(geodatuak, geodatuak.objects[aukerak.json_izena]).features)
                .enter().append("circle")
                .attr("transform", function(d) {
                    return "translate(" + sinbolo_proportzionalen_maparen_bidea.centroid(d) + ")";
                })
                .attr("r", function(d) {

                    // Bozkatu duten edo galdeketa iragarria duten udalerriek bakarrik izango dute zirkulua.
                    if (d.properties.datuak && (d.properties.datuak.emaitza || d.properties.datuak.data)) {

                        return radius(d.properties.datuak.biztanleria2014);

                    }
                })
                .attr("fill", function(d) {

                    if (d.properties.datuak) {

                        if (d.properties.datuak.emaitza) {

                            // Emaitza aldekoa bada...
                            if (d.properties.datuak.emaitza === "bai") {

                                return aukerak.koloreak.bai;

                            // Kontrakoa bada berriz...
                            } else {

                                return aukerak.koloreak.ez;

                            }
                        } else if (d.properties.datuak.data) {

                            return aukerak.koloreak.galdeketa_iragarria;

                        }
                    }

                    // Daturik ez badago...
                    return "#ffffff";

                })
                .on("mouseover", function(d) {
                    onMouseOver(d);
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", d.properties.datuak.botoa_emandakoak, d.properties.datuak.bai, d.properties.datuak.ez, aukerak.koloreak.bai, aukerak.koloreak.ez);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                });

            marraztuBiztanleriaVsGrafikoa("#biztanleria-vs-partehartzea-grafikoa", emaitzak, "biztanleria2014", "partehartzea", "Biztanleria", "Partehartzea (%)", aukerak.koloreak.galdeketa_iragarria);
            marraztuBiztanleriaVsGrafikoa("#biztanleria-vs-bai-grafikoa", emaitzak, "biztanleria2014", "bai", "Bai (%)", "Biztanleria", aukerak.koloreak.bai);
            marraztuBiztanleriaVsGrafikoa("#biztanleria-vs-ez-grafikoa", emaitzak, "biztanleria2014", "ez", "Ez (%)", "Biztanleria", aukerak.koloreak.ez);
            marraztuBiztanleriaVsGrafikoa("#langabezia-tasa-vs-partehartzea-grafikoa", emaitzak, "langabezia_tasa_2014", "partehartzea", "Langabezia tasa 2014 (%)", "Partehartzea (%)", aukerak.koloreak.ez);
            marraztuBiztanleriaVsGrafikoa("#langabezia-tasa-vs-biztanleria-grafikoa", emaitzak, "biztanleria2014", "langabezia_tasa_2014", "Biztanleria", "Langabezia tasa 2014 (%)", aukerak.koloreak.ez);
            bistaratuHerrienDatuenTaula(emaitzak);

        });
    });
}());
