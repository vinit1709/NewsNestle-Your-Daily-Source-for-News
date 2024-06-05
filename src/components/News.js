import React, { Component } from "react";
import Newsitem from "./Newsitem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

export class News extends Component {
  static defaultProps = {
    country: "in",
    pageSize: 8,
    category: "general",
    search: "",
  };

  static propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    search: PropTypes.string,
  };

  capitallizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: false,
      page: 1,
      totalResults: 0,
    };
    document.title = `NewsNestle - ${this.capitallizeFirstLetter(
      this.props.category
    )}`;
  }

  async updateNews() {
    this.props.setProgress(10);
    const { country, category, search, pageSize } = this.props;
    const { page } = this.state;
    let url;
    if (search) {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&q=${search}&apikey=${this.props.apiKey}&page=${page}&pageSize=${pageSize}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apikey=${this.props.apiKey}&page=${page}&pageSize=${pageSize}`;
    }
    this.setState({ loading: true });
    let data = await fetch(url);
    this.props.setProgress(30);
    let parsedData = await data.json();
    this.props.setProgress(60);
    this.setState({
      articles: parsedData.articles,
      totalResults: parsedData.totalResults,
      loading: false,
      searchPerformed: search !== "",
    });
    this.props.setProgress(100);
  }

  async componentDidMount() {
    this.updateNews();
  }

  async componentDidUpdate(prevProps) {
    if (
      this.props.search !== prevProps.search ||
      this.props.category !== prevProps.category
    ) {
      this.setState({ page: 1 });
      await this.updateNews();
    }
  }

  fetchMoreData = async () => {
    this.setState({ page: this.state.page + 1 });
    const { country, category, search, pageSize } = this.props;
    const { page } = this.state;
    let url;
    if (search) {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&q=${search}&apikey=${this.props.apiKey}&page=${page}&pageSize=${pageSize}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apikey=${
        this.props.apiKey
      }&page=${page + 1}&pageSize=${pageSize}`;
    }
    let data = await fetch(url);
    let parsedData = await data.json();
    this.setState({
      articles: this.state.articles.concat(parsedData.articles),
      totalResults: parsedData.totalResults,
      searchPerformed: search !== "",
    });
  };

  render() {
    return (
      <div className="container my-3">
        <h1 style={{ margin: "25px 0px" }}>NewsNestle - Top Headlines</h1>
        {this.state.loading && <Spinner />}
        {this.state.searchPerformed && (
          <b>
            <p>Search Result: {this.props.search}</p>
          </b>
        )}
        {!this.state.loading &&
          this.state.articles.length === 0 &&
          this.state.searchPerformed && (
            <b>
              <p>No results found for "{this.props.search}".</p>
            </b>
          )}
        <InfiniteScroll
          dataLength={this.state.articles.length}
          next={this.fetchMoreData}
          hasMore={this.state.articles.length !== this.state.totalResults}
          loader={this.state.loading && <Spinner />}
        >
          <div className="row">
            {this.state.articles.map((element) => {
              return (
                <div className="col-md-4" key={element.url}>
                  <Newsitem
                    title={element.title}
                    description={element.description ? element.description : ""}
                    newsUrl={element.url}
                    imageUrl={element.urlToImage}
                    author={element.author}
                    date={element.publishedAt}
                    source={element.source.name}
                  />
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
}

export default News;
