import { ActionButton } from "client/apps/edit/components/message"
import { mount } from "enzyme"
import React from "react"
import { MessageModal } from "../index"
import { ModalTypes } from "../modalTypes"

describe("MessageModal", () => {
  it("renders lock modal", () => {
    const type = "locked"
    const data = ModalTypes[type]
    const component = mount(<MessageModal {...getProps(type)} />)

    expect(component.text()).toContain(data.header.text)
    expect(component.text()).toContain(data.title)
    expect(component.find(ActionButton).length).toEqual(1)
  })

  it("renders timeout modal", () => {
    const type = "timeout"
    const data = ModalTypes[type]
    const component = mount(<MessageModal {...getProps(type)} />)

    expect(component.text()).toContain(data.header.text)
    expect(component.text()).toContain(data.title)
    expect(component.find(ActionButton).length).toEqual(2)
  })
})

const getProps = type => ({
  type,
  session: {
    timestamp: "2018-01-30T23:12:20.973Z",
    user: {
      name: "John Doe",
      email: "joe@artsymail.com",
      id: "123",
      current_channel: {
        id: "1",
        name: "Artsy Editorial",
        type: "editorial",
      },
    },
  },
  onClose: jest.fn(),
  onTimerEnded: jest.fn(),
})
