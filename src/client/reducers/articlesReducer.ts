import { actions } from "client/actions/articlesActions"
import { actions as editActions } from "client/actions/edit"
import { omit } from "lodash"
import { data as sd } from "sharify"
import u from "updeep"

export interface ArticlesState {
  articles: any[]
  articlesInSession: any // TODO: confirm typing
}

export const initialState: ArticlesState = {
  articles: sd.ARTICLES,
  articlesInSession: sd.ARTICLES_IN_SESSION || {},
}

/**
 * Data relevant to Article Lockout features, used on /articles
 */
export const articlesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.EDITED_ARTICLES_RECEIVED: {
      return u(
        {
          articlesInSession: action.payload,
        },
        state
      )
    }
    case editActions.START_EDITING_ARTICLE: {
      const session = action.payload

      return u(
        {
          articlesInSession: {
            [session.article]: session,
          },
        },
        state
      )
    }
    case editActions.STOP_EDITING_ARTICLE: {
      const sessions = omit(state.articlesInSession, action.payload.article)
      return {
        ...state,
        articlesInSession: sessions,
      }
    }
    default:
      return state
  }
}
