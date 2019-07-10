import {
  SeriesArticle,
  StandardArticle,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconRemove } from "@artsy/reaction/dist/Components/Publishing/Icon/IconRemove"
import { ArticleCard } from "@artsy/reaction/dist/Components/Publishing/RelatedArticles/ArticleCards/ArticleCard"
import { mount } from "enzyme"
import React from "react"
import { EditArticleCard, RemoveButton } from "../components/edit_article_card"

describe("EditArticleCard", () => {
  let props

  beforeEach(() => {
    props = {
      article: StandardArticle,
      series: SeriesArticle,
      onRemoveArticle: jest.fn(),
    }
    props.article.id = "123"
  })

  it("Renders an article card with remove button and edit link", () => {
    const component = mount(<EditArticleCard {...props} />)
    expect(component.find(ArticleCard).length).toBe(1)
    expect(component.find(IconRemove).length).toBe(1)
    expect(component.text()).toMatch("Edit Article")
    expect(component.html()).toMatch(`/articles/${props.article.id}/edit`)
  })

  it("Can remove an article on click", () => {
    const component = mount(<EditArticleCard {...props} />)
    component
      .find(RemoveButton)
      .at(0)
      .simulate("click")
    expect(props.onRemoveArticle.mock.calls[0][0]).toBe(props.article.id)
  })
})
