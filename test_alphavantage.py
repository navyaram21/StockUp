from agent.tools.alpha_vantage_server import get_stock_news, company_summary

# test news
news = get_stock_news("AAPL")
print(news)

# test overview
overview = company_summary("AAPL")
print(overview)
