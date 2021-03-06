import LayoutsEditorContent from './LayoutsEditorContent';
import LayoutsEditorSettings from './LayoutsEditorSettings';
import {Orientation, Type} from '../../layout';
import LibrariesBrowserArea from './browser/LibrariesBrowserArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import LayoutsBrowserArea from './browser/LayoutsBrowserArea';

const LayoutsEditor = {
    id: 'layouts',
    name: 'Iso Layouts Editor',
    icon: 'layout.png',
    content: LayoutsEditorContent,
    settings: LayoutsEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        library: 0,
        layout: 0,
        wireframe: false,
        grid: true
    }),
    stateHandler: {
        setLibrary(library) {
            this.setState({ library, layout: 0 });
        },
        setLayout(layout) {
            this.setState({ layout });
        },
        setWireframe(wireframe) {
            this.setState({ wireframe });
        },
        setGrid(grid) {
            this.setState({ grid });
        }
    },
    toolAreas: [
        LibrariesBrowserArea,
        LayoutsBrowserArea,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'layouts', root: true },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'libraries_browser' },
                    { type: Type.AREA, content_id: 'layouts_browser' }
                ]
            }
        ]
    }
};

export default LayoutsEditor;
