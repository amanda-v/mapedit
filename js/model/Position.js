'use strict';

export const MAP_HEIGHT_PX = 16*32768; // Total height of the map in px at max zoom level
export const RS_TILE_WIDTH_PX = 32, RS_TILE_HEIGHT_PX = 32; // Width and height in px of an rs tile at max zoom level
export const RS_OFFSET_X = -49000; // Amount to offset x coordinate to get correct value
export const RS_OFFSET_Y = -45000; // Amount to offset y coordinate to get correct value

export class Position {

    constructor(x, y, z) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = z;
    }

    static fromLatLng(map, latLng, z) {
        var point = map.project(latLng, map.getMaxZoom());
        var y = MAP_HEIGHT_PX - point.y;
        y = Math.round(y / 32768 * (256 * 56 * 2)) + RS_OFFSET_Y;
        var x = Math.round(point.x / 32768 * (256 * 56 * 2)) + RS_OFFSET_X;
        return new Position(x, y, z);
    }

    toLatLng(map) {
        return Position.toLatLng(map, this.x, this.y)
    }

    toCentreLatLng(map) {
        return Position.toLatLng(map, this.x + 0.5, this.y + 0.5)
    }

    static toLatLng(map, x, y) {
        x = ((x - RS_OFFSET_X) / (56 * 2 * 256) * 32768) ;
        y = (MAP_HEIGHT_PX - ((y - RS_OFFSET_Y) / (56*2 *256)) * 32768);
        return map.unproject(L.point(x, y), map.getMaxZoom());
    }

    getDistance(position) {
        var diffX = Math.abs(this.x - position.x);
        var diffY = Math.abs(this.y - position.y);
        return Math.sqrt((diffX * diffX) + (diffY * diffY));
    }

    toLeaflet(map) {
        var startLatLng = this.toLatLng(map)
        var endLatLng = new Position(this.x + 1, this.y + 1, this.z).toLatLng(map)

        return L.rectangle(L.latLngBounds(startLatLng, endLatLng), {
            color: "#33b5e5",
            fillColor: "#33b5e5",
            fillOpacity: 1.0,
            weight: 1,
            interactive: false
        });
    }

    getName() {
        return "Position";
    }

    equals(position) {
        return this.x === position.x && this.y === position.y && this.z === position.z;
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
};
