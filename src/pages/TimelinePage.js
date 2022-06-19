import React, { useState, useContext } from "react"
import axios from "axios"
import { LineWave, ThreeDots } from "react-loader-spinner"
import { useTheme } from "styled-components"
import { UserContext } from "../contexts/UserContext.js"

import PageLabel from "../components/shared/Labels/PageLabel.js"
import Posts from "../components/shared/Posts/Posts.js"
import Trending from "../components/shared/Trending/Trending.js"

import * as S from "../styles/style.js"
import Post from "../components/shared/Posts/Post"
import Modal from "react-modal"
import Swal from "sweetalert2"

import profilePic from "../assets/profile-placeholder.jpg"

export default function TimelinePage() {
  const [posts, setPosts] = useState(() => {
    getPosts()
  })
  const [loadedPosts, setLoadedPosts] = useState(false)
  const [loadPostsFail, setLoadPostsFail] = useState(false)
  const [publication, setPublication] = useState({
    shared_url: "",
    message: "",
  })
  const [loadingPublish, setLoadingPublish] = useState("Publish")
  const [activeButtonPublish, setActiveButtonPublish] = useState(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [postId, setPostId] = useState("")

  const theme = useTheme()

  const { user } = useContext(UserContext)
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }

  Modal.setAppElement(document.querySelector(".root"))

  function publishUrl(e) {
    e.preventDefault()

    setActiveButtonPublish(true)
    setLoadingPublish("Publishing...")

    axios
      .post(`${process.env.REACT_APP_API_URL}/publish`, publication, config)
      .then((res) => {
        console.log(res)
        setActiveButtonPublish(false)
        setLoadingPublish("Publish")
        setPublication({ shared_url: "", message: "" })
      })
      .catch((err) => {
        console.log(err)
        setLoadingPublish("Publish")
        setActiveButtonPublish(false)
        const { status } = err.response
        if (
          status === 400 ||
          status === 401 ||
          status === 422 ||
          status === 500
        ) {
          return Swal.fire({
            icon: "error",
            title: "Oops...",
            text: err.response.data,
          })
        }
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Publish error!",
        })
      })
  }

  function getPosts() {
    const LIMIT = 20
    const ORDERBY = "created_at"
    const ORDER_DIR = "desc"

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/posts?limit=${LIMIT}&order=${ORDERBY}&direction=${ORDER_DIR}`,
      )
      .then((response) => {
        setPosts(response.data)
        setLoadedPosts(true)
      })
      .catch((error) => {
        setLoadedPosts(true)
        setLoadPostsFail(true)
      })
  }

  function handleTryLoadAgain() {
    setLoadedPosts(false)
    setLoadPostsFail(false)
    getPosts()
  }

  function openModal() {
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
  }

  async function deletePost() {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/posts/${postId}`,
        config,
      )
      closeModal()
      handleTryLoadAgain()
    } catch ({ response }) {
      closeModal()
      const { status } = response
      if (
        status === 400 ||
        status === 401 ||
        status === 422 ||
        status === 500
      ) {
        return Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data,
        })
      }
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error to delete post!",
      })
    }
  }

  if (!loadedPosts) {
    return (
      <S.Loading>
        <h1>Loading...</h1>
        <ThreeDots color="#000000" height={80} width={80} />
      </S.Loading>
    )
  }

  // TODO put image of user in publishBox

  return (
    <S.PageContainer>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="_"
        overlayClassName="_"
        contentElement={(props, children) => (
          <S.ModalStyle {...props}>{children}</S.ModalStyle>
        )}
        overlayElement={(props, contentElement) => (
          <S.OverlayStyle {...props}>{contentElement}</S.OverlayStyle>
        )}
      >
        <span>
          Are you sure you want <br /> to delete this post?
        </span>
        <div>
          <button onClick={closeModal}>No, go back</button>
          <button onClick={deletePost}>Yes, delete it</button>
        </div>
      </Modal>
      <PageLabel>timeline</PageLabel>
      <S.ContentWrapper>
        <S.MainContentWrapper>
          <S.PublishCard>
            <S.PostCardLeftColumn>
              <S.CardProfileImage
                src={
                  user.profile_image.length > 0
                    ? user.profile_image
                    : profilePic
                }
                alt={user.username}
              />
            </S.PostCardLeftColumn>
            <S.PostCardRightColumn>
              <h2>What are you going to share today?</h2>
              <form className="input-box" onSubmit={publishUrl}>
                <input
                  className="input-url"
                  type="text"
                  disabled={activeButtonPublish}
                  placeholder="http://..."
                  value={publication.shared_url}
                  onChange={(e) =>
                    setPublication({
                      ...publication,
                      shared_url: e.target.value,
                    })
                  }
                />

                <input
                  className="input-message"
                  type="text"
                  disabled={activeButtonPublish}
                  placeholder="What's on your mind?"
                  value={publication.message}
                  onChange={(e) =>
                    setPublication({ ...publication, message: e.target.value })
                  }
                />
                <div className="containerButton">
                  {/* TODO ARRUMAR GAMBIARRA PARA BOTÃO */}
                  <S.Button className="button-publish" type="submit">
                    {loadingPublish}
                  </S.Button>
                </div>
              </form>
            </S.PostCardRightColumn>
          </S.PublishCard>
          <Posts>
            {posts &&
              posts.map((post) => {
                return (
                  <Post
                    key={post.id}
                    post={post}
                    setPostId={() => setPostId(post.id)}
                    openModal={() => openModal()}
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
