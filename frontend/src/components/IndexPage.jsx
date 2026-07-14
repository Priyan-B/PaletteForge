function IndexPage() {
  console.log("IndexPage rendered");

  fetch("/api/wireframes")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });

  return <div>IndexPage</div>;
}

export default IndexPage;
