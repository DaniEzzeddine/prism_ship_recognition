import axios from 'axios';
import React, { Component } from 'react';
import { List, ListItem } from 'semantic-ui-react';

import ShipCard from './ShipCard';
import SearchForm from './SearchForm';

import './App.css';

export default class App extends Component {
  state = {
    data: [],
  }

  renderShipList = (data) => {
    return (
      <List className="ship_list">
        {data.map((ship) =>
          <ListItem className="ship_card">
            <ShipCard
              key={ship.name}
              snapshot={ship.snapshot}
              name={ship.name}
              time={ship.time}
              description={ship.description}
            />
          </ListItem>
        )}
      </List>
    )
  }

  handleSubmit = (from, to) => {
    axios.get('http://localhost:6357/prism/acc', {
      params: {
        fromDate: from,
        toDate: to,
      },
    }).then(res => this.setState({ data: res.data, err: res.err }));
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        <div className="search_form">
          <SearchForm handleSubmit={this.handleSubmit} />
        </div>
          {this.renderShipList(data)}
      </div>
    );
  }
}
