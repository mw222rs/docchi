var Reflux = require('reflux');
var actions = require('../actions');
var Firebase = require('firebase');
//_ = require('lodash'),

var storiesRef = new Firebase('https://blazing-fire-8429.firebaseio.com/stories/');

module.exports = Reflux.createStore({
  init() {

    storiesRef.on('value', this.updateStories.bind(this));

    // storiesRef.on("child_removed", this.updateStoriesChildRemoved.bind(this));
    // storiesRef.on("child_added", this.updateStoriesChildAdded.bind(this));

    this.listenTo(actions.addStoryStart, this.onAddStoryStart.bind(this));
    this.listenTo(actions.editStoryPartText, this.onEditStoryPartText.bind(this));
    this.listenTo(actions.destroyStoryPart, this.onDestroyStoryPart.bind(this));
    this.listenTo(actions.destroyStoryParts, this.onDestroyStoryParts.bind(this));
    this.listenTo(actions.addStoryPart, this.onAddStoryPart.bind(this));
    // this.listenTo(actions.changeSelected, this.onChangeSelected.bind(this));
    // this.listenTo(actions.changeFocus, this.onChangeFocus.bind(this));
    // this.listenTo(actions.resetFocus, this.resetFocus);
  },
  onAddStoryPart(storyPart) {

    console.log(storyPart);

    var containerKey = storyPart.parentKey.split('/');
    console.log(containerKey);

    var newChild = storiesRef.child(containerKey[0] + '/' + containerKey[1]).push({
      title: storyPart.title,
      txt: storyPart.txt,
      isEnding: storyPart.isEnding
    });

    var concatKey = containerKey[0] + '/stories/' + newChild.key();

    newChild.update({
      key: concatKey
    });

    var parent = storiesRef.child(storyPart.parentKey).child('children').child(newChild.key());

    parent.set({
      key: concatKey
    });

    // var newChild = storiesRef.push({ // Creates new post for child-node
    //   title: storyPart.title,
    //   txt: storyPart.txt,
    //   isEnding: storyPart.isEnding
    // });
    // newChild.update({ // Adds the key to the newly created child-node
    //   key: newChild.key()
    // });

    // var parent = storiesRef.child(storyPart.parentKey).child('children').child(newChild.key());

    // parent.set({ // And to the child-field of the parent
    //   key: newChild.key()
    // });
  },
  onAddStoryStart(storyStart) {

    var container = storiesRef.push({
      title: storyStart.title
    });
    container.update({
      key: container.key()
    });

    // var containerPush = storiesRef.child(container.key());

    var newParent = container.child('stories').push({  // Adds new post
      title: storyStart.title,
      txt: storyStart.txt,
      isParent: true
    });

    newParent.update({ // Attaches key to key-field
      key: container.key() + '/stories/' + newParent.key()
    });
  },
  onEditStoryPartText(key, text) {

    console.log(key);

    var thatStoryPartRef = storiesRef.child(key);

    thatStoryPartRef.update({
      txt: text
    });

  },
  onDestroyStoryPart(key, parentKey, last) {

    var splat = key.split('/');

    var storyRef = storiesRef.child(key);

    var parentRef = parentKey === '' ? '' : storiesRef.child(parentKey.toString()).child('children').child(splat[2]);

    storyRef.remove(function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Successfully destroyed storypart with key: ' + key);

        if (parentKey !== '') {
          parentRef.remove(function(error) {
            if (error) {
              console.log(error.code);
            } else {
              console.log('Destroyed children-field on parent.');
            }
          });
        }
      }
    });

    if (parentKey === '' && last) {

      var containerRef = storiesRef.child(splat[0]);
      containerRef.remove(function(error) {
        if (error) {
          console.log(error);
        } else {
          console.log('Successfully destroyed container.');
        }
      });

    }
  },
  onDestroyStoryParts(array, parentKey) {
    array.forEach(function(key, index, array) {
      actions.destroyStoryPart(key, parentKey, index === (array.length-1));
    });
  },
  onChangeRefFocus(key) {
    this.focusedRef = storiesRef.child(key);
    this.trigger();
  },
  resetSelected() {
    this.trigger({selected:{}, focus: {}});
  },
  resetFocus() {
    this.trigger({focus: {}, statusWord: 'Skriv', h3: 'Ny historia'});
  },
  onChangeFocus(focus, title) {
    this.trigger({focus: focus, statusWord: 'Fortsätt på', h3: title});
  },
  updateSelected(snap) {
    this.trigger({selected:(this.last = snap.val() || {})});
  },
  updateStories(snap) {
    // console.log('VALUE');
    // console.log(snap.val());

    this.trigger({stories:(this.last = snap.val() || {})});
  },
  getDefaultData() {

    console.log('default data');

    var stories;

    storiesRef.on('value', function(snap) {
      stories = snap.val();
    });

    return stories || {};
  }
});