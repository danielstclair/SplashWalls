// import React, {
//   View,
//   Text,
//   Component,
//   ActivityIndicatorIOS
// } from 'react';

const React = require('react-native');
const {
  View,
  Text,
  Component,
  ActivityIndicatorIOS
} = React;

class ProgressHUD extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { width, height, isVisible } = this.props;
    if ( isVisible ) {
      return (
        <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width,
            height,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <ActivityIndicatorIOS 
            animating={true}
            color={'#fff'}
            size={'large'}
            style={{margin: 15}} />
          <Text style={{color:'#fff'}}>Please wait...</Text>
        </View>
      );
    }
    else {
      return (<View></View>)
    }
  }
}

module.exports = ProgressHUD;