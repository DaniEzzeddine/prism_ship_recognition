import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'

class SearchForm extends Component {
    state = {
        from: '',
        to: '',
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        const { from, to} = this.state;

        return (
            <div>
                <Form onSubmit={() => this.props.handleSubmit(from, to)}>
                    <Form.Group>
                        <Form.Input
                            placeholder='From'
                            name='from'
                            type="date"
                            value={from}
                            onChange={this.handleChange}
                        />
                        <Form.Input
                            placeholder='To'
                            type="date"
                            name='to'
                            value={to}
                            onChange={this.handleChange}
                        />
                        <Form.Button content='Submit' />
                    </Form.Group>
                </Form>
            </div>
        )
    }
}

export default SearchForm