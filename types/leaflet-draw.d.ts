import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: DrawOptions);
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const DRAWVERTEX: string;
      const EDITSTART: string;
      const EDITMOVE: string;
      const EDITRESIZE: string;
      const EDITVERTEX: string;
      const EDITSTOP: string;
      const DELETESTART: string;
      const DELETESTOP: string;
    }
  }

  interface DrawOptions {
    position?: string;
    draw?: {
      polyline?: boolean | {
        shapeOptions?: L.PolylineOptions;
      };
      polygon?: boolean | {
        allowIntersection?: boolean;
        showArea?: boolean;
        shapeOptions?: L.PolylineOptions;
      };
      rectangle?: boolean | any;
      circle?: boolean | any;
      marker?: boolean | any;
      circlemarker?: boolean | any;
    };
    edit?: {
      featureGroup: L.FeatureGroup;
      edit?: boolean;
      remove?: boolean;
    };
  }
} 