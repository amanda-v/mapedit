"use strict";

import { Config } from "../config.js";
import { Position } from "../model/Position.js";

export var NPCCoordinatesControl = L.Control.extend({
  options: {
    position: "topleft",
  },

  npc: {
    idx: 0,
    npcType: 0,
    currentCords: {
      x: 0,
      y: 0,
      z: 0,
    },
    prevCords: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  npcs: [],

  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.id = "coordinates-container";
    container.style.height = "auto";
    L.DomEvent.disableClickPropagation(container);
    const ws_connection = Config.ws.ws_connection;

    // this._testMove();
    // return container;

    ws_connection.on("connected_server", (data) => {
      console.log("msg from the server: ", data.msg);
      ws_connection.emit("npc_client", { msg: "hi server" });
    });
    ws_connection.on("npc_server", (data) => {
      console.log("msg from the server to npc: ", data.msg);
      var that = this;
      //Generating new random npc's coords every 3 seconds
      setInterval(function () {
        var action = that.npcs.length < 3 ? 0 : Math.floor(Math.random() * 3); // 0: new, 1: update, 2: delete, 3: update bot
        if (action === 0) {
          that.npc.idx =
            that.npcs.length === 0
              ? 0
              : that.npcs[that.npcs.length - 1].idx + 1;
          that.npc.npcType = Math.floor(Math.random() * 2); //0: general npc, 1: special npc
          that.npc.currentCords.x = Math.floor(
            (Math.random() - 0.5) * 49000 * 2
          );
          that.npc.currentCords.y = Math.floor(
            (Math.random() - 0.5) * 45000 * 2
          );
          // console.log(that.npc);
        } else if (action === 1) {
          that.npc.currentCords.x = Math.floor(
            (Math.random() - 0.5) * 49000 * 2
          );
          that.npc.currentCords.y = Math.floor(
            (Math.random() - 0.5) * 45000 * 2
          );
          do {
            var tempIdx = Math.floor(
              Math.random() * that.npcs[that.npcs.length - 1].idx
            );
            var tempNPC = that.npcs.find((elem) => elem.idx == tempIdx);
            console.log(tempNPC);
            if (tempNPC != undefined) {
              that.npc.idx = tempIdx;
              that.npc.npcType = tempNPC.npcType;
              that.npc.prevCords = tempNPC.currentCords;
            }
          } while (tempNPC == undefined);
        } else if (action === 2) {
          do {
            var tempIdx = Math.floor(
              Math.random() * that.npcs[that.npcs.length - 1].idx
            );
            var tempNPC = that.npcs.find((elem) => elem.idx == tempIdx);
            console.log(tempNPC);
            if (tempNPC != undefined) {
              that.npc.idx = tempIdx;
              that.npc.npcType = tempNPC.npcType;
              that.npc.prevCords = tempNPC.currentCords;
            }
          } while (tempNPC == undefined);
        }

        that._updateCoordinates(action);
      }, 5000);
    });

    return container;
  },

  _updateCoordinates: function (action) {
    var x = this.npc.currentCords.x;
    var y = this.npc.currentCords.y;
    var z = this.npc.currentCords.z;
    var markers = [];
    var that = this;

    if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(z)) {
      return;
    }

    var npc_type = this.npc.npcType == 0 ? "General" : "Special";
    var popupContent =
      npc_type + " NPC " + this.npc.idx + " on x:" + x + " y:" + y + " z: " + z;

    if (action === 1) {
      console.log("marker updated ");

      this._removeMarker();
      //   this.npc.prevCords = this.npc.currentCords;
      // this._addMarker();
      this._moveMarker();
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
      this._removeNpcFromList(this.npc.idx);
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
      console.log("npc:");
      console.log(this.npc);
      var tempNpc = {
        idx: that.npc.idx,
        npcType: that.npc.npcType,
        currentCords: {
          x: that.npc.currentCords.x,
          y: that.npc.currentCords.y,
          z: that.npc.currentCords.z,
        },
        prevCords: {
          x: that.npc.prevCords.x,
          y: that.npc.prevCords.y,
          z: that.npc.prevCords.z,
        },
      };
      that.npcs.push(tempNpc);
      console.log(that.npcs);
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
            that.npc.prevCords.x,
            that.npc.prevCords.y,
            that.npc.prevCords.z
          ).toCentreLatLng(that._map);
          var tempLatlng = layer.getLatLng();

          if (tempLatlng.lat == newLatlng.lat && tempLatlng.lng) {
            that._map.removeLayer(layer);
          }
        }
      }
    });
  },
  _moveMarker: function () {
    var markerIcon = this._getMarkerColor();
    this._searchMarker = L.Marker.movingMarker(
      [
        new Position(
          this.npc.prevCords.x,
          this.npc.prevCords.y,
          this.npc.prevCords.z
        ).toCentreLatLng(this._map),
        new Position(
          this.npc.currentCords.x,
          this.npc.currentCords.y,
          this.npc.currentCords.z
        ).toCentreLatLng(this._map),
      ],
      [2000],
      { autostart: true, loop: false, icon: markerIcon }
    );
    this._addPopupContentTo();
    this._searchMarker.addTo(this._map);
  },
  _testMove: function () {
    var markerIcon = this._getMarkerColor();
    var tempMarker = L.Marker;
    tempMarker
      .movingMarker(
        [
          new Position(8000, -20177, 1).toCentreLatLng(this._map),
          new Position(34426, 27889, 1).toCentreLatLng(this._map),
        ],
        [2000],
        { autostart: true, loop: false, icon: markerIcon }
      )
      .addTo(this._map);
    console.log("test move");
  },
  _addMarker: function () {
    var x = this.npc.currentCords.x;
    var y = this.npc.currentCords.y;
    var z = this.npc.currentCords.z;

    var markerIcon = this._getMarkerColor();

    this._searchMarker = new L.marker(
      new Position(x, y, z).toCentreLatLng(this._map),
      { icon: markerIcon }
    );
    this._addPopupContentTo();
    this._searchMarker.addTo(this._map);

    // this._map.panTo(this._searchMarker.getLatLng());
  },
  _removeNpcFromList: function (idx) {
    this.npcs = this.npcs.filter((elem) => elem.idx != idx);
  },

  _getMarkerColor: function () {
    var npc_type = this.npc.npcType;
    var marker_icon = npc_type == 0 ? "grey" : "red";
    var markerIcon = new L.Icon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-" +
        marker_icon +
        ".png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    return markerIcon;
  },

  _addPopupContentTo: function () {
    var popupContent =
      "<p>NPC " +
      this.npc.idx +
      "<br> NPC type: " +
      this.npc.npcType +
      " <br> x:" +
      this.npc.currentCords.x +
      "<br> y:" +
      this.npc.currentCords.y +
      "<br> z: " +
      this.npc.currentCords.z +
      "</p>";
    this._searchMarker.bindPopup(popupContent).openPopup();
  },
});
