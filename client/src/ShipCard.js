import { Card, Image } from 'semantic-ui-react'
import React, { Component } from 'react'

export default class ShipCard extends Component {
    render() {
        return (
            <Card>
            <Image src={this.props.snapshot} wrapped ui={false} />
            <Card.Content>
              <Card.Header>{this.props.name}</Card.Header>
              <Card.Meta>
                <span className='date'>{this.props.time}</span>
              </Card.Meta>
              <Card.Description>
                {this.props.description}
              </Card.Description>
            </Card.Content>
          </Card>
        )
    }
}