import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ImageCollection } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import {
  ArticleImage,
  EditImage,
} from "client/apps/edit/components/content/sections/images/components/edit_image"
import { mount } from "enzyme"
import { extend } from "lodash"
import React from "react"
import {
  DragPlaceholder,
  DragTarget,
  DragTargetContainer,
} from "../drag_target"

jest.mock("lodash/debounce", () => jest.fn(e => e))

describe("DragTarget", () => {
  let props
  const image: ArticleImage = extend(ImageCollection[0], { type: "image" })

  const imageProps = {
    article: StandardArticle,
    image,
    index: 0,
    isHero: false,
    editing: false,
    section: ImageCollection,
    width: 200,
    onChangeHeroAction: jest.fn(),
    onChangeSectionAction: jest.fn(),
    progress: 0,
  }

  const getWrapper = (passedProps = props) => {
    return mount(
      <DragTarget {...passedProps}>
        <EditImage {...imageProps} />
      </DragTarget>
    )
  }

  beforeEach(() => {
    props = {
      dragStartY: 200,
      isActiveSource: false,
      isActiveTarget: false,
      isDraggable: true,
      index: 2,
      setDragTarget: jest.fn(),
    }
  })

  it("Renders children", () => {
    const component = getWrapper()
    expect(component.find(EditImage)).toHaveLength(1)
  })

  it("Sets up this.debouncedDragTarget", () => {
    const component = getWrapper().instance() as DragTarget
    expect(component.debouncedDragTarget).toBeInstanceOf(Function)
  })

  it("Calls #setDragTarget and props.setDragTarget on dragOver", done => {
    const component = getWrapper()
    component.find(DragTarget).simulate("dragOver", { clientY: 300 })

    expect(props.setDragTarget).toBeCalledWith(
      2,
      { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 },
      100
    )
    done()
  })

  it("#setDragTarget does not call props.setDragTarget if isActiveTarget", done => {
    props.isActiveTarget = true
    const component = getWrapper()
    component.find(DragTarget).simulate("dragOver", { clientY: 300 })

    expect(props.setDragTarget).not.toBeCalled()
    done()
  })

  describe("#renderDropZone", () => {
    it("Hides DragPlaceholder by default", () => {
      const component = getWrapper()
      expect(component.find(DragPlaceholder).length).toBe(0)
    })

    it("Shows DragPlaceholder if isActiveTarget && isDraggable", () => {
      props.isActiveTarget = true
      const component = getWrapper()
      expect(component.find(DragPlaceholder).length).toBe(1)
    })

    // TODO: re-implement tests once vertical drag variant is enabled
    // toBeInstanceOf returns object in enzyme@3.9.0
    xit("Shows DragPlaceholder above content by default", () => {
      props.isActiveTarget = true
      const component = getWrapper()
        .find(DragTargetContainer)
        .childAt(0)
      expect(component.childAt(0).instance()).toBeInstanceOf(DragPlaceholder)
      expect(component.childAt(1).instance()).toBeInstanceOf(EditImage)
    })

    xit("Shows DragPlaceholder below content if dropPosition is bottom", () => {
      props.isActiveTarget = true
      props.dropPosition = "bottom"
      const component = getWrapper()
        .find(DragTargetContainer)
        .childAt(0)
      expect(component.childAt(0).instance()).toBeInstanceOf(EditImage)
      expect(component.childAt(1).instance()).toBeInstanceOf(DragPlaceholder)
    })

    it("Hides DragPlaceholder if !isDraggable", () => {
      props.isActiveTarget = true
      props.isDraggable = false
      const component = getWrapper()
      expect(component.find(DragPlaceholder).length).toBe(0)
    })

    it("Hides DragPlaceholder if isActiveSource", () => {
      props.isActiveTarget = true
      props.isActiveSource = true
      const component = getWrapper()
      expect(component.find(DragPlaceholder).length).toBe(0)
    })
  })
})
