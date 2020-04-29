"use strict";

import { Config } from "../config.js";
import { Position } from "../model/Position.js";

export var NPCCoordinatesControl = L.Control.extend({
  options: {
    position: "topleft",
  },

  currentCords: {
    idx: 0,
    x: 0,
    y: 0,
    z: 0,
  },
  npcs: {},

  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.id = "coordinates-container";
    container.style.height = "auto";
    L.DomEvent.disableClickPropagation(container);
    const ws_url = Config.ws.url;
    const ws_connection = new WebSocket(ws_url);

    this.npcs = [];

    ws_connection.onopen = () => {
      ws_connection.send("hi, server!");
    };
    ws_connection.onmessage = (e) => {
      var that = this;
      //Generating new random npc's coords every 3 seconds
      setInterval(function () {
        var action = that.npcs.length < 3 ? 0 : Math.floor(Math.random() * 3); // 0: new, 1: update, 2: delete
        var currentNpcIdx;
        if (action === 0) {
          that.currentCords.idx =
            that.npcs.length === 0
              ? 0
              : that.npcs[that.npcs.length - 1].idx + 1;
          that.currentCords.x = Math.floor((Math.random() - 0.5) * 49000 * 2);
          that.currentCords.y = Math.floor((Math.random() - 0.5) * 45000 * 2);
          that.currentCords.z = 1;
          that.npcs.push(that.currentCords);
        } else {
          do {
            var tempIdx = Math.floor(
              Math.random() * that.npcs[that.npcs.length - 1].idx
            );
            that.currentCords = that.npcs[tempIdx];
          } while (that.currentCords.idx == undefined);
        }

        that._updateCoordinates(action);
      }, 5000);
    };
    return container;
  },

  _updateCoordinates: function (action) {
    var x = this.currentCords.x;
    var y = this.currentCords.y;
    var z = this.currentCords.z;
    var markers = [];
    var that = this;

    if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(z)) {
      return;
    }

    var popupContent =
      "NPC " + this.currentCords.idx + " on x:" + x + " y:" + y + " z: " + z;

    if (action === 1) {
      console.log("marker updated ");
      this._removeMarker();
      this._addMarker();
      Swal({
        position: "top",
        type: "success",
        title: `Marker update`,
        text: popupContent,
        showConfirmButton: false,
        timer: 4000,
        toast: true,
      });
    } else if (action === 2) {
      console.log("marker removed ");
      this._removeMarker();
      Swal({
        position: "top",
        type: "success",
        title: `Marker removed`,
        text: popupContent,
        showConfirmButton: false,
        timer: 4000,
        toast: true,
      });
    } else if (action === 0) {
      console.log("marker added ");
      this._addMarker();
      Swal({
        position: "top",
        type: "success",
        title: `Add new marker`,
        text: popupContent,
        showConfirmButton: false,
        timer: 4000,
        toast: true,
      });
    }

    // if (this._map.plane != z) {
    //   this._map.plane = z;
    //   this._map.updateMapPath();
    // }
  },

  _removeMarker: function () {
    var that = this;
    that._map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        if (that._map.getBounds().contains(layer.getLatLng())) {
          //   markers.push(layer);
          var newLatlng = new Position(
            that.currentCords.x,
            that.currentCords.y,
            that.currentCords.z
          ).toCentreLatLng(that._map);
          var tempLatlng = layer.getLatLng();

          if (tempLatlng.lat == newLatlng.lat && tempLatlng.lng) {
            that._map.removeLayer(layer);
          }
        }
      }
    });
  },
  _addMarker: function () {
    var x = this.currentCords.x;
    var y = this.currentCords.y;
    var z = this.currentCords.z;

    this._searchMarker = new L.marker(
      new Position(x, y, z).toCentreLatLng(this._map)
    );

    var popupContent =
      "<p>NPC " +
      this.currentCords.idx +
      " <br> x:" +
      x +
      "<br> y:" +
      y +
      "<br> z: " +
      z +
      "</p>";
    this._searchMarker.bindPopup(popupContent).openPopup();

    this._searchMarker.addTo(this._map);

    this._map.panTo(this._searchMarker.getLatLng());
  },
});
