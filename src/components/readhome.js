var React = require('react');
var LeanStoryList = require('./leanstorylist');

var ReadHome = React.createClass({

  render: function() {
    return (
      <div className="read-list">
        <LeanStoryList {...this.props} titleText="Historier " isWriteList={false} filter="done" linkTo="readnodes" />
      </div>
    );
  }

});

module.exports = ReadHome;
