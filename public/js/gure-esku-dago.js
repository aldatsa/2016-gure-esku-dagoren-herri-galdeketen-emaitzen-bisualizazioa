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

    function bistaratuHerriarenEmaitzenGrafikoa(id, hautesleak, bai, ez, bai_kolorea, ez_kolorea) {

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

    function kalkulatuEhunekoa(balioa, guztira, hamartarrak) {

        return (100 * parseInt(balioa, 10) / guztira).toFixed(hamartarrak).replace(/\./g, ',');

    }

    function onMouseOut(d) {

        tip.hide();

    }

    function onMouseOver(d) {

        tip.html(function(d) {

            var guztira = parseInt(d.properties.datuak.bai, 10) + parseInt(d.properties.datuak.ez, 10) + parseInt(d.properties.datuak.zuria, 10) + parseInt(d.properties.datuak.baliogabea, 10);

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

                    var biztanleria2014 = 0;

                    if (d.lurralde_kodea === e.properties.ud_kodea) {

                        biztanleria2014 = parseInt(d.biztanleria2014.replace(/\./g, ''), 10);

                        // Udalerri honetako datuak mapako bere elementuarekin lotu.
                        e.properties.datuak = d;

                        if (d.emaitza === "bai") {

                            herriak.alde++;
                            biztanleak.alde = biztanleak.alde + parseInt(d.bai, 10);
                            biztanleak.aurka = biztanleak.aurka + parseInt(d.ez, 10);

                        } else if (d.emaitza === "ez") {

                            herriak.aurka++;
                            biztanleak.alde = biztanleak.alde + parseInt(d.bai, 10);
                            biztanleak.aurka = biztanleak.aurka + parseInt(d.ez, 10);

                        } else {

                            herriak.erabakitzeke++;
                            biztanleak.erabakitzeke = biztanleak.erabakitzeke + biztanleria2014;

                        }

                        biztanleak.guztira = biztanleak.guztira + biztanleria2014;

                        herriak.guztira++;
                    }

                });
            });

            console.log(biztanleak.guztira);
            console.log(herriak.guztira);

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
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", parseInt(d.properties.datuak.hautesleak, 10), parseInt(d.properties.datuak.bai, 10), parseInt(d.properties.datuak.ez, 10), aukerak.koloreak.bai, aukerak.koloreak.ez);
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
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", parseInt(d.properties.datuak.hautesleak, 10), parseInt(d.properties.datuak.bai, 10), parseInt(d.properties.datuak.ez, 10), aukerak.koloreak.bai, aukerak.koloreak.ez);
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
                                       return parseInt(d.properties.datuak.biztanleria2014.replace(/\./g, ''), 10);
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

                        return radius(parseInt(d.properties.datuak.biztanleria2014.replace(/\./g, ''), 10));

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
                    bistaratuHerriarenEmaitzenGrafikoa("#tip-grafikoa", parseInt(d.properties.datuak.hautesleak, 10), parseInt(d.properties.datuak.bai, 10), parseInt(d.properties.datuak.ez, 10), aukerak.koloreak.bai, aukerak.koloreak.ez);
                })
                .on("mouseout", function(d) {
                    onMouseOut(d);
                });

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
        });
    });
}());
