import { useState, useEffect, Fragment, useContext } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { Card, Col, Row } from "react-bootstrap";
import moment from "moment";

import * as CONSTANTS from "constants/Constants";
import { LoadingSpinner } from "components";
import { GlobalContext } from "../context";

const MarketNews = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);
  const [marketNews, setMarketNews] = useState([]);
  const context = useContext(GlobalContext);

  // Load market news
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    // get some latest market news
    const getMarketNews = async () => {
      const token = context.isGuest
        ? context.guestToken
        : await getAccessTokenSilently();
      setIsLoading(true);
      await fetch(CONSTANTS.API_URL + CONSTANTS.API_MARKET_NEWS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: signal,
      })
        .then(async (response) => {
          const marketNews = await response.json();

          setMarketNews(marketNews["news_data"]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    getMarketNews();
  }, []);

  const renderCard = (card, index) => {
    const date = moment.unix(card.datetime);

    return (
      <Col>
        <Card key={index}>
          <a href={card.url}>
            <Card.Img variant="top" src={card.image} />
          </a>
          <Card.Body>
            <Card.Title>{card.headline}</Card.Title>
            <Card.Text>{card.summary}</Card.Text>
          </Card.Body>
          <Card.Link href={card.url}>Read more</Card.Link>
          <Card.Footer>
            <small className="text-muted">
              posted {moment(date).fromNow()}
            </small>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {isLoading ? <LoadingSpinner /> : marketNews.map(renderCard)}
    </Row>
  );
};

export default MarketNews;
