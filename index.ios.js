/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  ActivityIndicatorIOS,
  View,
  Dimensions,
  PanResponder,
  CameraRoll,
  AlertIOS
} from 'react-native';
import RandManager from './RandManager';
// import ProgressHUD from './ProgressHUD';
import Utils from './Utils';
const ProgressHUD = require('./ProgressHUD');
const NetworkImage = require('react-native-image-progress');
const Progress = require('react-native-progress');
const Swiper = require('react-native-swiper');
var ShakeEvent = require('react-native-shake-event-ios');
// const Utils = require('./Utils');

const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300;
const DOUBLE_TAP_RADIUS = 20;
const { width, height } = Dimensions.get('window');

class SplashWalls extends Component {
  constructor() {
    super();
    this.state = {
      wallsJSON: [],
      isLoading: true,
      isHudVisible: false
    };
    this.imagePanResponder = {};
    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    };
    this.currentWallIndex = 0;
    this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
  }
  fetchWallsJSON() {
    const url = `http://unsplash.it/list`;
    fetch(url)
      .then( response => response.json() )
      .then(jsonData => {
        const randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
        let walls = [];
        randomIds.forEach(randomId => {
          walls.push(jsonData[randomId]);
        });
        this.setState({
          isLoading: false,
          wallsJSON: [].concat(walls)
        });
      })
      .catch(error => console.log(`Fetch error ${error}`));
  }
  initialize() {
    this.setState({
      wallsJSON: [],
      isLoading: true,
      isHudVisible: false
    });
    this.currentWallIndex = 0;
  }
  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });
    ShakeEvent.addEventListener('shake', () => {
      this.initialize();
      this.fetchWallsJSON();
    });
  }
  componentDidMount() {
    this.fetchWallsJSON();
  }
  handleStartShouldSetPanResponder(e, gestureState) {
    return true;
  }
  isDoubleTap(currentTouchTimeStamp, { x0, y0 }) {
    const { prevTouchX, prevTouchY, prevTouchTimeStamp } = this.prevTouchInfo;
    const dt = currentTouchTimeStamp - prevTouchTimeStamp;
    return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
  }
  saveCurrentWallpaperToCameraRoll() {
    this.setState({isHudVisible: true});
    const { wallsJSON } = this.state;
    const currentWall = wallsJSON[this.currentWallIndex];
    console.log(currentWall);
    const currentWallURL = `http://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;
    CameraRoll.saveImageWithTag(currentWallURL) 
      .then((data) => {
        this.setState({isHudVisible: false});
        AlertIOS.alert(
          'Saved',
          'Wallpaper successfully saved to Camera Roll',
          [
            {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
          ]
        );
      })
      .catch((err) => {
        console.log('Error saving to camera roll', err);
      });
  }
  handlePanResponderGrant(e, gestureState) {
    const currentTouchTimeStamp = Date.now();
    if (this.isDoubleTap(currentTouchTimeStamp, gestureState)) {
      this.saveCurrentWallpaperToCameraRoll();
    }
    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimeStamp: currentTouchTimeStamp
    };
  }
  handlePanResponderEnd(e, gestureState) {
    console.log('finger pulled up from the image');
  }
  onMomentumScrollEnd(e, state, context) {
    console.log(state);
    this.currentWallIndex = state.index;
  }
  renderLoadingMessage() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicatorIOS
          animating={true}
          color={'#fff'}
          size={'small'}
          style={{margin: 15}} />
        <Text style={{color: '#fff'}}>Contacting Unsplash</Text>
      </View>
    );
  }
  renderResults() {
    const { wallsJSON, isLoading } = this.state;
    return (
      <View>
        <Swiper
          index={this.currentWallIndex}
          dot={<View style={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
          activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}
          loop={false}
          onMomentumScrollEnd={this.onMomentumScrollEnd}>
          {wallsJSON.map((wallpaper, index) => {
            return (
              <View key={index}>
                <NetworkImage
                  { ...this.imagePanResponder.panHandlers }
                  source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                  indicator={Progress.Circle}
                  style={styles.wallpaperImage}
                  indicatorProps={{ color: 'rgba(255, 255, 255)', size: 60, thickness: 7 }}>
                  <Text style={ styles.label }>Photo by</Text>
                  <Text style={ styles.label_authorName }>{ wallpaper.author }</Text>
                </NetworkImage>
              </View>
            );
          })}
        </Swiper>
        <ProgressHUD width={width} height={height} isVisible={this.state.isHudVisible} />
      </View>
    );
  }
  render() {
    const { isLoading } = this.state;
    if (isLoading) {
      return this.renderLoadingMessage();
    }
    else {
      return this.renderResults();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  label: {
    position: 'absolute',
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 20,
    left: 20,
    width: width/2
  },
  label_authorName: {
    position: 'absolute',
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 41,
    left: 20,
    fontWeight: 'bold',
    width: width/2
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  wallpaperImage: {
    flex: 1,
    width,
    height,
    backgroundColor: '#000'
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
