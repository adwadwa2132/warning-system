declare module 'leaflet-draw' {
  import * as L from 'leaflet';

  namespace L {
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
      
      interface DrawOptions {
        polyline?: any;
        polygon?: any;
        rectangle?: any;
        circle?: any;
        marker?: any;
        circlemarker?: any;
      }
      
      interface EditOptions {
        featureGroup: L.FeatureGroup;
        edit?: any;
        remove?: any;
      }
    }

    namespace Control {
      interface DrawConstructorOptions {
        position?: L.ControlPosition;
        draw?: Draw.DrawOptions;
        edit?: Draw.EditOptions;
      }
      
      class Draw extends L.Control {
        constructor(options?: DrawConstructorOptions);
      }
    }

    interface FeatureGroup extends L.FeatureGroup {
      _drawnItems?: boolean;
    }
  }
} 