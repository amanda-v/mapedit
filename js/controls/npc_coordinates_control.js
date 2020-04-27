"use strict";

import { Config } from "../config.js";
import { Position } from "../model/Position.js";

export var NPCCoordinatesControl = L.Control.extend({
  options: {
    position: "topleft",
  },

  currentCords: {
    x: 0,
    y: 0,
    z: 0,
  },

  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.id = "coordinates-container";
    container.style.height = "auto";
    L.DomEvent.disableClickPropagation(container);
    const ws_url = Config.ws.url;
    const ws_connection = new WebSocket(ws_url);
    ws_connection.onopen = () => {
      ws_connection.send("hey");
    };
    ws_connection.onmessage = (e) => {
      var that = this;
      setInterval(function () {
        var isNew = Math.round(Math.random()); // 1 or 0

        that.currentCords.x = Math.floor((Math.random() - 0.5) * 49000 * 2);
        that.currentCords.y = Math.floor((Math.random() - 0.5) * 45000 * 2);
        that.currentCords.z = 1;
        that._updateCoordinates(isNew);
      }, 3000);
    };
    return container;
  },

  _updateCoordinates: function (isNew) {
    var x = this.currentCords.x;
    var y = this.currentCords.y;
    var z = this.currentCords.z;

    if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(z)) {
      return;
    }

    if (!isNew && this._searchMarker !== undefined) {
      this._map.removeLayer(this._searchMarker);
    }

    this._searchMarker = new L.marker(
      new Position(x, y, z).toCentreLatLng(this._map)
    );

    this._searchMarker.addTo(this._map);

    this._map.panTo(this._searchMarker.getLatLng());

    if (this._map.plane != z) {
      this._map.plane = z;
      this._map.updateMapPath();
    }
  },

  _addMarker: function () {
    var x = this.currentCords.x;
    var y = this.currentCords.y;
    var z = this.currentCords.z;

    if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(z)) {
      return;
    }
    var marker = new L.marker(
      new Position(x, y, z).toCentreLatLng(this._map)
    ).addTo(this._map);
  },
});
