import React from 'react';
import {map, concat, times, isObject} from 'lodash';

export default class Node extends React.Component {
    constructor(props) {
        super(props);
        const node = props.node;
        this.state = {
            collapsed: this.props.level > (node.dynamic ? 0 : 1),
            name: this.name(),
            numChildren: this.numChildren(),
            nodeProps: this.nodeProps(),
            selected: call('selected', node, this.props.data),
            menu: null,
            renaming: false,
        };
    }

    componentWillMount() {
        if (this.props.node.dynamic || this.props.node.selected) {
            this.props.ticker.register(this);
        }
    }

    componentWillUnmount() {
        if (this.props.node.dynamic || this.props.node.selected) {
            this.props.ticker.unregister(this);
        }
    }

    frame() {
        if (this.props.node.dynamic) {
            const name = this.name();
            if (name !== this.state.name) {
                this.setState({name});
            }
            const numChildren = this.numChildren();
            if (numChildren !== this.state.numChildren) {
                this.setState({numChildren});
            }
            const nodeProps = this.nodeProps();
            const oldProps = this.state.nodeProps;
            if (nodeProps.length !== oldProps.length) {
                this.setState({nodeProps});
            } else {
                for (let i = 0; i < nodeProps.length; ++i) {
                    let foundDiff = false;
                    const p = nodeProps[i];
                    const op = oldProps[i];
                    if (p.id !== op.id) {
                        foundDiff = true;
                    } else if (typeof(p.value) !== typeof(op.value)) {
                        foundDiff = true;
                    } else if (isObject(p.value) && isObject(op.value)) {
                        if (p.value.key !== op.value.key) {
                            foundDiff = true;
                        }
                    } else if (p.value !== op.value) {
                        foundDiff = true;
                    }
                    if (foundDiff) {
                        this.setState({nodeProps});
                        break;
                    }
                }
            }
        }
        const selected = call('selected', this.props.node, this.props.data);
        if (selected !== this.state.selected) {
            this.setState({selected});
        }
    }

    render() {
        const fontSize = this.props.fontSize || 18;
        const childFontSize = Math.max(fontSize - 2, 14);

        return <div>
            <div style={{fontSize, padding: `${fontSize / 8}px 0`}}>
                {this.renderCollapseButton()}
                &nbsp;
                {this.renderName()}
                &nbsp;
                {this.renderProps()}
            </div>
            <div style={{paddingLeft: '2ch'}}>{this.renderChildren(childFontSize)}</div>
            {this.renderContextMenu()}
        </div>;
    }

    renderContextMenu() {
        const menu = this.state.menu;
        if (menu) {
            const menuStyle = {
                position: 'fixed',
                left: menu.x - 4,
                top: menu.y - 4,
                padding: 4,
                background: '#cccccc',
                color: '#000000',
                border: '2px solid black',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)'
            };

            const onClick = () => {
                this.setState({menu: null, renaming: true});
            };

            return <div style={menuStyle} onClick={onClick} onMouseLeave={() => this.setState({menu: null})}>Rename</div>;
        }
    }

    renderName() {
        const node = this.props.node;
        const selected = this.state.selected;
        const setRoot = this.props.setRoot.bind(null, this.props.path);
        const onClick = node.onClick ? node.onClick.bind(null, this.props.data, setRoot) : setRoot;

        const nameStyle = {
            cursor: 'pointer',
            background: selected ? 'white' : 'transparent',
            color: selected ? 'black' : 'inherit',
            padding: selected ? '0 2px' : 0
        };

        const onContextMenu = (e) => {
            e.preventDefault();
            if (node.allowRenaming && node.allowRenaming(this.props.data)) {
                this.setState({menu: {x: e.clientX, y: e.clientY}});
            }
        };

        const onKeyDown = (e) => {
            const key = e.code || e.which || e.keyCode;
            if (key === 'Enter' || key === 13 && e.target.value) {
                node.rename(this.props.data, e.target.value);
                this.setState({renaming: false});
            } else if (key === 'Esc' || key === 27) {
                this.setState({renaming: false});
            }
            e.stopPropagation();
        };

        const onBlur = () => {
            this.setState({renaming: false});
        };

        const renaming = this.state.renaming;

        return <span style={nameStyle} onClick={onClick} onContextMenu={renaming ? null : onContextMenu}>
            {renaming
                ? <input onBlur={onBlur} onKeyDown={onKeyDown}/>
                : this.state.name}
        </span>;
    }

    renderCollapseButton() {
        const toggleCollapse = () => {
            this.setState({collapsed: !this.state.collapsed});
        };

        const numChildren = this.state.numChildren;
        const collapsed = this.state.collapsed;
        if (numChildren > 0) {
            return <span onClick={toggleCollapse} style={{cursor: 'pointer'}}>{collapsed ? '+' : '-'}</span>;
        } else {
            return <span>&bull;</span>;
        }
    }

    renderProps() {
        const nodeProps = this.state.nodeProps;
        const propStyle = {
            padding: '0 3px',
            verticalAlign: 'middle'
        };
        if (nodeProps) {
            return <span style={{color: '#858585'}}>
            {
                map(nodeProps, prop => {
                    return prop.render ? <span key={prop.id} style={propStyle}>{prop.render(prop.value)}</span> : null;
                })
            }
        </span>;
        } else {
            return null;
        }
    }

    renderChildren(childFontSize) {
        const node = this.props.node;
        if (!this.state.collapsed) {
            return node.dynamic
                ? this.renderDynamicChildren(childFontSize)
                : this.renderStaticChildren(childFontSize);
        }
    }

    renderStaticChildren(childFontSize) {
        return map(
            this.props.node.children,
            (child, idx) => this.renderChild(childFontSize, child, idx)
        );
    }

    renderDynamicChildren(childFontSize) {
        return times(
            this.state.numChildren,
            (idx) => {
                const child = this.call('child', idx);
                const childData = this.call('childData', idx);
                return this.renderChild(childFontSize, child, idx, childData);
            }
        );
    }

    renderChild(childFontSize, child, idx, childData) {
        if (!child)
            return null;

        const childName = child.dynamic ? call('name', child, childData, idx) : child.name;
        const path = concat(this.props.path, childName || idx);
        return <Node key={path.join('/')}
                     node={child}
                     data={childData}
                     fontSize={childFontSize}
                     setRoot={this.props.setRoot}
                     path={path}
                     ticker={this.props.ticker}
                     level={this.props.level + 1}/>
    }

    numChildren() {
        const node = this.props.node;
        return node.dynamic ? this.call('numChildren') : node.children.length;
    }

    name() {
        const node = this.props.node;
        return node.dynamic ? this.call('name') : node.name;
    }

    nodeProps() {
        const node = this.props.node;
        return node.dynamic ? this.call('props') : (node.props ? node.props : []);
    }

    call(method, arg) {
        return call(method, this.props.node, this.props.data, arg);
    }
}

function call(method, node, data, arg) {
    const fct = node[method];
    const ok = node.needsData ? data !== undefined : true;
    if (fct && ok) {
        return fct(data, arg);
    } else if (method === 'numChildren') {
        return 0;
    } else if (method === 'props') {
        return [];
    }
}