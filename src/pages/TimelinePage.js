import React, { useState } from "react"
import axios from "axios"
import { LineWave } from "react-loader-spinner"
import { useTheme } from "styled-components"

import PageLabel from "../components/shared/Labels/PageLabel.js"
import PublishBox from "../components/shared/PublishBox/PublishBox.js"
import Posts from "../components/shared/Posts/Posts.js"
import Post from "../components/shared/Posts/Post"
import Trending from "../components/shared/Trending/Trending.js"

import * as S from "../styles/style.js"

export default function TimelinePage() {
  const [posts, setPosts] = useState(() => {
    getPosts()
  })
  console.log("🚀 ~ posts", posts)
  const [loadedPosts, setLoadedPosts] = useState(false)
  const [loadPostsFail, setLoadPostsFail] = useState(false)

  const theme = useTheme()

  function getPosts() {
    const LIMIT = 20
    const ORDERBY = "created_at"
    const ORDER_DIR = "desc"

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/posts?limit=${LIMIT}&order=${ORDERBY}&direction=${ORDER_DIR}`,
      )
      .then((response) => {
        setPosts([...response.data])
        setLoadedPosts(true)
      })
      .catch((error) => {
        setLoadedPosts(true)
        setLoadPostsFail(true)
      })
  }

  function handleTryLoadAgain() {
    console.log("rodei")

    setLoadedPosts(false)
    setLoadPostsFail(false)
    getPosts()
  }

  return (
    <S.PageContainer>
      <PageLabel>timeline</PageLabel>
      <S.ContentWrapper>
        <S.MainContentWrapper>
          <PublishBox posts={posts} setPosts={setPosts} />
          <Posts>
            {loadedPosts &&
              posts &&
              posts.map((post) => {
                return (
                  <Post
                    key={post.id}
                    post={post}
                    handleTryLoadAgain={() => handleTryLoadAgain()}
                  />
                )
              })}
            {!loadedPosts && (
              <S.LoadingPosts>
                <LineWave
                  color="red"
                  firstLineColor={theme.colors.text1}
                  middleLineColor={theme.colors.linkPreviewBorder}
                  lastLineColor={theme.colors.secondary}
                  height={200}
                  width={200}
                  ariaLabel="three-circles-rotating"
                />
              </S.LoadingPosts>
            )}
            {loadPostsFail && (
              <S.ErrorLoadMessage>
                <p>
                  An error occured while trying to fetch the posts, please
                  refresh the page or click{" "}
                  <span onClick={handleTryLoadAgain}>here</span> to try again.
                </p>
              </S.ErrorLoadMessage>
            )}
            {posts && posts.length === 0 && (
              <S.NoPostsContainer>
                <p>There are no posts yet.</p>
              </S.NoPostsContainer>
            )}
          </Posts>
        </S.MainContentWrapper>
        <S.SecondaryContentWrapper>
          <Trending></Trending>
        </S.SecondaryContentWrapper>
      </S.ContentWrapper>
    </S.PageContainer>
  )
}
