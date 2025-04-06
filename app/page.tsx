import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <>
      <TodoList />
      <AddTodoForm />
    </>
  );
}
