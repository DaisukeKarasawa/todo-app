require "rails_helper"

RSpec.describe "APi::V1::Todos", type: :request do
  describe "GET /api/v1/todos" do
    it "空のTODOリストが取得できること" do
      get api_v1_todos_path
      expect(response).to have_http_status(:success)
      expect(JSON.parse(response.body)).to be_empty
    end

    it "レスポンスのJSON形式が正しいこと" do
      todo = create(:todo)
      get api_v1_todos_path
      expect(response).to have_http_status(:success)

      json = JSON.parse(response.body).first
      expect(json).to include(
        "id" => todo.id,
        "title" => todo.title,
        "is_completed" => todo.is_completed,
        "created_at" => todo.created_at.as_json,
        "updated_at" => todo.updated_at.as_json
      )
    end
  end

  describe "POST /api/v1/todos" do
    context "正常系" do
      it "有効なタイトルでTODOが作成できること" do
        todo_params = { todo: { title: "New Todo" } }
        expect {
          post api_v1_todos_path, params: todo_params
        }.to change(Todo, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["title"]).to eq("New Todo")
        expect(json["is_completed"]).to be_falsey
      end
    end

    context "異常系" do
      it "タイトルが空の場合はエラーが発生すること" do
        todo_params = { todo: { title: "" } }
        post api_v1_todos_path, params: todo_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Title can't be blank")
      end

      it "タイトルがnilの場合はエラーが発生すること" do
        todo_params = { todo: { title: nil } }
        post api_v1_todos_path, params: todo_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Title can't be blank")
      end
    end
  end

  describe "PUT /api/v1/todos/:id" do
    let(:todo) { create(:todo) }

    context "正常系" do
      it "タイトルが更新できること" do
        todo_params = { todo: { title: "Updated Todo" } }
        put api_v1_todo_path(todo), params: todo_params
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)["title"]).to eq("Updated Todo")
      end

      it "完了状態が更新できること" do
        todo_params = { todo: { is_completed: true } }
        put api_v1_todo_path(todo), params: todo_params
        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)["is_completed"]).to be_truthy
      end
    end

    context "異常系" do
      it "存在しないIDの場合はエラーが発生すること" do
        todo_params = { todo: { title: "Updated Todo" } }
        put api_v1_todo_path(999999), params: todo_params
        expect(response).to have_http_status(:not_found)
      end

      it "タイトルが空の場合はエラーが発生すること" do
        todo_params = { todo: { title: "" } }
        put api_v1_todo_path(todo), params: todo_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Title can't be blank")
      end

      it "タイトルがnilの場合はエラーが発生すること" do
        todo_params = { todo: { title: nil } }
        put api_v1_todo_path(todo), params: todo_params
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Title can't be blank")
      end
    end
  end

  describe "DELETE /api/v1/todos/:id" do
    let(:todo) { create(:todo) }

    context "正常系" do
      it "TODOが削除できること" do
        expect {
          delete api_v1_todo_path(todo)
        }.to change(Todo, :count).by(0)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "異常系" do
      it "存在しないIDの場合はエラーが発生すること" do
        delete api_v1_todo_path(999999)
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end