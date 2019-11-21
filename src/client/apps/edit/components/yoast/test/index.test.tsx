import { Input } from "@artsy/reaction/dist/Components/Input"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { clone } from "lodash"
import React from "react"
import {
  RemoveSimulatedDOMElements,
  SimulateDOMElements,
} from "test/helpers/document-elements"
import {
  CloseIcon,
  ResolveMessage,
  Yoast,
  YoastContainer,
  YoastOutput,
  YoastSnippet,
} from "../index"

describe("Yoast", () => {
  const getWrapper = (passedProps = props) => {
    return mount(<Yoast {...passedProps} />)
  }

  let props

  beforeEach(() => {
    props = {
      article: clone(StandardArticle),
      yoastKeyword: "ceramics",
      setYoastKeywordAction: jest.fn(),
    }
    SimulateDOMElements()
  })

  afterEach(() => {
    RemoveSimulatedDOMElements()
  })

  describe("Rendering", () => {
    it("renders an input field", () => {
      const component = getWrapper()
      expect(component.find(Input).length).toBe(1)
    })

    it("populates the input field with the yoast keyword", () => {
      const component = getWrapper()
      expect(component.find(Input).props().value).toBe("ceramics")
    })

    it("doesn't populate the input field with the yoast keyword if no yoast keyword exists", () => {
      props.yoastKeyword = ""
      const component = getWrapper()
      expect(component.find(Input).props().value).toBe("")
    })

    it("renders a close icon", () => {
      const component = getWrapper()
      expect(component.find(CloseIcon).length).toBe(1)
    })

    it("renders a yoast output container", () => {
      const component = getWrapper()
      expect(component.find(YoastOutput).length).toBe(1)
    })

    it("renders a yoast snippet container", () => {
      const component = getWrapper()
      expect(component.find(YoastSnippet).length).toBe(1)
    })
  })

  describe("#getBodyText", () => {
    it("returns body text", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const fullText = instance.getBodyText()
      const firstSection = fullText.slice(
        0,
        props.article.sections[0].body.length
      )
      expect(firstSection).toBe(props.article.sections[0].body)
    })
  })

  describe("#keywordIsBlank", () => {
    it("returns false if yoast keyword is not blank", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const returnValue = instance.keywordIsBlank()
      expect(returnValue).toBe(false)
    })

    it("returns true if yoast keyword is blank", () => {
      props.yoastKeyword = ""
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const returnValue = instance.keywordIsBlank()
      expect(returnValue).toBe(true)
    })
  })

  describe("#toggleDrawer", () => {
    it("sets isOpen to true when the yoast header is clicked", () => {
      const component = getWrapper()
      expect(component.state("isOpen")).toBe(false)
      component.find(YoastContainer).simulate("click")
      expect(component.state("isOpen")).toBe(true)
    })

    it("sets isOpen to false when the yoast header is clicked a second time", () => {
      const component = getWrapper()
      expect(component.state("isOpen")).toBe(false)
      component.find(YoastContainer).simulate("click")
      component.find(YoastContainer).simulate("click")
      expect(component.state("isOpen")).toBe(false)
    })

    it("rotates icon when the yoast header is clicked", () => {
      const component = getWrapper()
      component.find(YoastContainer).simulate("click")
      expect(component.find(CloseIcon).prop("rotation")).toBe(45)
    })

    it("rotates icon back to original position when the yoast header is clicked a second time", () => {
      const component = getWrapper()
      component.find(YoastContainer).simulate("click")
      component.find(YoastContainer).simulate("click")

      expect(component.find(CloseIcon).prop("rotation")).toBe(0)
    })
  })

  describe("#generateResolveMessage", () => {
    it("returns 'Set Target Keyword' if there is no yoast keyword", () => {
      props.yoastKeyword = ""
      const component = getWrapper()
      const instance = component.instance() as Yoast

      const resolveMessage = instance.generateResolveMessage()
      expect(resolveMessage).toBe(" Set Target Keyword")
    })

    it("turns message red when there is no yoast keyword", () => {
      props.yoastKeyword = ""
      const component = getWrapper()
      const color = component.find(ResolveMessage).prop("color")
      const red = "red100"
      expect(color).toBe(red)
    })

    it("turns message red when there is at least 1 issue", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast

      const firstIssue = document.createElement("div")
      firstIssue.className += "bad"

      const output = document.getElementById("yoast-output")

      if (output) {
        output.appendChild(firstIssue)
      }

      // both need to be updated
      instance.forceUpdate()
      component.update()

      const color = component.find(ResolveMessage).prop("color")
      const red = "red100"
      expect(color).toBe(red)
    })

    it("returns '1 Unresolved Issue' message if there is a yoast keyword and one issue", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast

      const firstIssue = document.createElement("div")
      firstIssue.className += "bad"

      const output = document.getElementById("yoast-output")

      if (output) {
        output.appendChild(firstIssue)
      }

      const resolveMessage = instance.generateResolveMessage()
      expect(resolveMessage).toBe("1 Unresolved Issue")
    })

    it("returns '2 Unresolved Issues' message if there is a yoast keyword and two issues", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast

      const firstIssue = document.createElement("div")
      firstIssue.className += "bad"

      const secondIssue = document.createElement("div")
      secondIssue.className += "bad"

      const output = document.getElementById("yoast-output")

      if (output) {
        output.appendChild(firstIssue)
        output.appendChild(secondIssue)
      }

      const resolveMessage = instance.generateResolveMessage()
      expect(resolveMessage).toBe("2 Unresolved Issues")
    })

    it("returns 'Resolved' if there is a yoast keyword but no issues", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast

      const resolveMessage = instance.generateResolveMessage()
      expect(resolveMessage).toBe(" Resolved")
    })

    it("turns message green when there is a keyword and no issues", () => {
      const component = getWrapper()
      const color = component.find(ResolveMessage).prop("color")
      const green = "green100"
      expect(color).toBe(green)
    })
  })

  describe("#setSnippetFields", () => {
    it("sets snippet title", () => {
      getWrapper()
      let titleText

      // using document because component.find("#snippet-editor-title") was not finding the element
      const snippetTitle = document.getElementById(
        "snippet-editor-title"
      ) as HTMLInputElement
      if (snippetTitle) {
        titleText = snippetTitle.value
      }
      expect(titleText).toEqual(
        props.article.search_title ||
          props.article.thumbnail_title ||
          props.article.title ||
          ""
      )
    })

    it("sets snippet description", () => {
      getWrapper()
      let descriptionText

      // using document because component.find("#snippet-editor-title") was not finding the element
      const snippetDescription = document.getElementById(
        "snippet-editor-meta-description"
      )
      if (snippetDescription) {
        descriptionText = snippetDescription.innerText
      }
      expect(descriptionText).toEqual(
        props.article.search_description || props.article.description || ""
      )
    })
  })

  describe("#getSeoTitle", () => {
    it("returns article's thumbnail title when search title does not exist", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const seoTitle = instance.getSeoTitle()
      expect(seoTitle).toEqual("New York's Next Art District")
    })

    it("returns article's search title when it exists", () => {
      props.article.search_title = "a search title"
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const seoTitle = instance.getSeoTitle()
      expect(seoTitle).toEqual("a search title")
    })

    it("returns article's title when thumbnail and search title do not exist", () => {
      props.article.thumbnail_title = null
      props.article.title = "a title"
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const seoTitle = instance.getSeoTitle()
      expect(seoTitle).toEqual("a title")
    })
  })

  describe("#getSeoDescription", () => {
    it("returns article's description when search description does not exist", () => {
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const seoDescription = instance.getSeoDescription()
      expect(seoDescription).toEqual(
        "Land exhibitions, make influential contacts, and gain valuable feedback about your work."
      )
    })

    it("returns article's search description when it exists", () => {
      props.article.search_description = "a search description"
      const component = getWrapper()
      const instance = component.instance() as Yoast
      const seoDescription = instance.getSeoDescription()
      expect(seoDescription).toEqual("a search description")
    })
  })
})
