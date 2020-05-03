"use strict";

import { Config } from "../config.js";
import { Position } from "../model/Position.js";

export var PlayerCoordinatesControl = L.Control.extend({
  options: {
    position: "topleft",
  },

  player: {
    idx: 0,
    playerType: 0,
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
  players: [],

  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.id = "coordinates-container";
    container.style.height = "auto";
    L.DomEvent.disableClickPropagation(container);
    const ws_connection = Config.ws.ws_connection;

    ws_connection.on("connected_server", (data) => {
      console.log("msg from the server: ", data.msg);
      ws_connection.emit("player_client", { msg: "hi server" });
    });
    ws_connection.on("player_server", (data) => {
      console.log("msg from the server to player: ", data.msg);
      var that = this;
      //Generating new random player's coords every 3 seconds
      setInterval(function () {
        var action =
          that.players.length < 3 ? 0 : Math.floor(Math.random() * 3); // 0: new, 1: update, 2: delete, 3: update bot
        if (action === 0) {
          that.player.idx =
            that.players.length === 0
              ? 0
              : that.players[that.players.length - 1].idx + 1;
          that.player.playerType = Math.floor(Math.random() * 2); //0: general player, 1: special player
          that.player.currentCords.x = Math.floor(
            (Math.random() - 0.5) * 49000 * 2
          );
          that.player.currentCords.y = Math.floor(
            (Math.random() - 0.5) * 45000 * 2
          );
          // console.log(that.player);
        } else if (action === 1) {
          that.player.currentCords.x = Math.floor(
            (Math.random() - 0.5) * 49000 * 2
          );
          that.player.currentCords.y = Math.floor(
            (Math.random() - 0.5) * 45000 * 2
          );
          do {
            var tempIdx = Math.floor(
              Math.random() * that.players[that.players.length - 1].idx
            );
            var tempplayer = that.players.find((elem) => elem.idx == tempIdx);
            console.log(tempplayer);
            if (tempplayer != undefined) {
              that.player.idx = tempIdx;
              that.player.playerType = tempplayer.playerType;
              that.player.prevCords = tempplayer.currentCords;
            }
          } while (tempplayer == undefined);
        } else if (action === 2) {
          do {
            var tempIdx = Math.floor(
              Math.random() * that.players[that.players.length - 1].idx
            );
            var tempplayer = that.players.find((elem) => elem.idx == tempIdx);
            console.log(tempplayer);
            if (tempplayer != undefined) {
              that.player.idx = tempIdx;
              that.player.playerType = tempplayer.playerType;
              that.player.prevCords = tempplayer.currentCords;
            }
          } while (tempplayer == undefined);
        }

        that._updateCoordinates(action);
      }, 9000);
    });

    return container;
  },

  _updateCoordinates: function (action) {
    var x = this.player.currentCords.x;
    var y = this.player.currentCords.y;
    var z = this.player.currentCords.z;
    var markers = [];
    var that = this;

    if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(z)) {
      return;
    }

    var player_type = this.player.playerType == 0 ? "General" : "Special";
    var popupContent =
      player_type +
      " player " +
      this.player.idx +
      " on x:" +
      x +
      " y:" +
      y +
      " z: " +
      z;

    if (action === 1) {
      console.log("marker updated ");

      this._removeMarker();
      //   this.player.prevCords = this.player.currentCords;
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
      this._removeplayerFromList(this.player.idx);
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
      console.log("player:");
      console.log(this.player);
      var tempplayer = {
        idx: that.player.idx,
        playerType: that.player.playerType,
        currentCords: {
          x: that.player.currentCords.x,
          y: that.player.currentCords.y,
          z: that.player.currentCords.z,
        },
        prevCords: {
          x: that.player.prevCords.x,
          y: that.player.prevCords.y,
          z: that.player.prevCords.z,
        },
      };
      that.players.push(tempplayer);
      console.log(that.players);
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
            that.player.prevCords.x,
            that.player.prevCords.y,
            that.player.prevCords.z
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
    var x = this.player.currentCords.x;
    var y = this.player.currentCords.y;
    var z = this.player.currentCords.z;
    var player_type = this.player.playerType;
    var marker_icon = player_type == 0 ? "blue" : "blue";
    var greenIcon = new L.Icon({
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

    this._searchMarker = new L.marker(
      new Position(x, y, z).toCentreLatLng(this._map),
      { icon: greenIcon }
    );

    var popupContent =
      "<p>player " +
      this.player.idx +
      "<br> player type: " +
      player_type +
      " <br> x:" +
      x +
      "<br> y:" +
      y +
      "<br> z: " +
      z +
      "</p>";
    this._searchMarker.bindPopup(popupContent).openPopup();

    this._searchMarker.addTo(this._map);

    // this._map.panTo(this._searchMarker.getLatLng());
  },
  _removeplayerFromList: function (idx) {
    this.players = this.players.filter((elem) => elem.idx != idx);
  },
});
