import React, { Component } from 'react';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {HEADER_TOOLBAR_HEIGHT,FOOTER_TOOLBAR_HEIGHT, APP_TITLEBAR_HEIGHT} from '../constants/ViewConstants';
import { bindActionCreators } from 'redux';
import '../../style/sass/style.scss';
import cx from 'classnames';
import List from '../components/List';
import Chart from '../components/Chart';
import Gauge from '../components/Gauge';
import FittedText from '../components/FittedText';

import {MAXREADINGS} from '../constants/ChartConstants';
import * as AppActions from '../actions/AppActions';
import {fetchChannelId} from '../actions/ChannelActions';


function lookup(boxes, name){
    return  boxes.reduce((acc, arr, i)=>{
        return arr.reduce((_acc, item, j)=>{
            if (item === name){
                return {row: i, col: j};
            }
            return _acc;
        }, acc);

    },{row:-1,col:-1});
}

class AppContent extends Component {
	
	constructor(props){
		super(props);
		Object.assign(this, ...bindActionCreators(AppActions, props.dispatch));	
	} 
	
	componentDidMount(){
		this.props.dispatch(fetchChannelId());
  		window.addEventListener('resize', this._handleResize);
	}

	render() {
	
		const flexcontainer = {
			height: `calc(100vh - ${HEADER_TOOLBAR_HEIGHT+FOOTER_TOOLBAR_HEIGHT}px)`,
			width: `calc(100vw - 5px)`,
		}

		const { apps, layout, dispatch, dimensions } = this.props;
		const {w,h} = dimensions;
		
		const height = h - (HEADER_TOOLBAR_HEIGHT+FOOTER_TOOLBAR_HEIGHT);
		
		const totalrows = layout ? Object.keys(layout).length : 1;
		const APPCONTAINERHEIGHT = (height / totalrows);
		
	    const applist = Object.keys(apps).map((appkey,i)=>{
	    	  
	        const approw = apps[appkey];
	        
	        return Object.keys(approw).map((sourcekey,j)=>{
	    		
	    		const {row,col} = lookup(layout[appkey],sourcekey);
	    		console.log(`for app ${appkey}, source:${sourcekey} row is ${row} col is ${col}`);
	    	
	    		
	    		const app = approw[sourcekey];
	    		const totalcols = layout[appkey][row].length;
	    		console.log(`total cols for app ${appkey}, source:${sourcekey} are ${totalcols} and total rows are ${layout[appkey].length}`); 
	    		
	    		const APPHEIGHT =  (APPCONTAINERHEIGHT - APP_TITLEBAR_HEIGHT) / layout[appkey].length; 
	    		
	    		console.log(`APPCONTAINERHEIGHT IS ${APPCONTAINERHEIGHT} APPHEIGHT = ${APPHEIGHT}`);
	    		
	    		const APPWIDTH  = (w/totalcols);
	    		
				let style = {
					position: 'absolute',
					width: APPWIDTH,
					left: APPWIDTH * col,
					height: APPHEIGHT,
					top:  HEADER_TOOLBAR_HEIGHT + APP_TITLEBAR_HEIGHT + (APPCONTAINERHEIGHT * i) + (APPHEIGHT * row),		
				}
			
				let dataview = null;
			
				const data = app.data;
			
			
				switch (app.view){	
				
					case 'gauge':
						dataview = 	<Gauge {...{w: APPWIDTH, h: APPHEIGHT, data: app}} /> 	
						break;
					
					case 'bar':
						let [config, ...values] = data;
						dataview = 	<Chart {...{w: APPWIDTH, h: APPHEIGHT, config: config, data: values.slice(-MAXREADINGS)}} /> 	
						break;
					
					case 'text':
						dataview = <FittedText {...{w:APPWIDTH,h:APPHEIGHT, data:data || ""}} />;
						break;
								
					case 'list':
					
						if (data === Object(data)){ //if this is a valid javascript object
					
							data.keys = data.keys || [];
							data.rows = data.rows || [];
							const props = {keys: data.keys, rows: data.rows};
							dataview = <List {...props}/>
								  
						}
						break;
			
				}


				const {view} =  app;

				const classname = cx({
					flexitem: true,
					[view]:true,
				})

				const titlebar = {
					position: 'absolute',
					left: 0,
					top: HEADER_TOOLBAR_HEIGHT + (APPCONTAINERHEIGHT * i),
					height: APP_TITLEBAR_HEIGHT,
					width: w,
					boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
					background: '#445662',
					color: 'white',
					fontSize: '1.3em',
					lineHeight: `${APP_TITLEBAR_HEIGHT}px`,
					textAlign: 'center',
				}
					
				const remove = {
					width: 40,
					WebkitBoxFlex: 0, 
					WebkitFlex: '0 0 auto',
					flex: '0 0 auto',
				}
								
				return  <div>
							{j==0 && <div style={titlebar}>
								<div className="row">
									<div style={remove}>
										<div className="centered" onClick={this.appRemoved.bind(this, app.id)}><i className="fa fa-times fa-fw"></i></div>
									</div>
									<div>
										<div className="centered">{app.name}</div>
									</div>
								</div>
							</div> }
							<div key={`${appkey}${sourcekey}`} style={style}>
								<div key={i} className={classname}>
									{dataview}
								</div>		
					   		</div>
					   	</div>    
			        
	        });
	    	
	    });

	    return <ReactCSSTransitionGroup className="container" style={flexcontainer} transitionName="flexitem" transitionEnterTimeout={500} transitionLeaveTimeout={300}>{applist}</ReactCSSTransitionGroup>
         	
	}
};

function select(state) {
  return {
    apps: state.apps,
    layout: state.layout,
    dimensions: state.screen.dimensions,
  };
}

AppContent.contextTypes = {
	store: React.PropTypes.object,
}

export default connect(select)(AppContent);
